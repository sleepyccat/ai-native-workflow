#!/usr/bin/env node

/**
 * 飞书 UAT 自动刷新脚本
 *
 * 流程：
 * 1. 检查当前 token 是否有效
 * 2. 无效时先尝试 refresh_token 刷新（无需浏览器）
 * 3. 刷新失败则启动 OAuth 授权流程，自动打开浏览器
 * 4. 获取新 token 后自动写入 MCP 配置文件（默认 ~/.kiro/settings/mcp.json）
 *
 * 用法：
 *   node feishu_uat_refresh.js          # 自动检查并刷新
 *   node feishu_uat_refresh.js --force  # 强制重新授权
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const url = require('url');

// ============ 路径 ============
const HOME = process.env.USERPROFILE || process.env.HOME;
const SKILLS_DIR = path.join(__dirname, '..', '..');
const CONFIG_PATH = path.join(SKILLS_DIR, 'config.json');
const TOKEN_STORE_PATH = path.join(__dirname, '.feishu-uat.json');

// ============ 配置 ============
function loadSkillsConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    console.error(`  错误: 未找到配置文件 ${CONFIG_PATH}`);
    console.error('  请复制 config.example.json 为 config.json 并填写你的飞书应用凭证');
    process.exit(1);
  }
}

function resolvePath(p) {
  if (!p) return p;
  return p.replace(/^~[/\\]/, HOME + path.sep);
}

const _cfg = loadSkillsConfig();
const APP_ID = _cfg.feishu?.app_id;
const APP_SECRET = _cfg.feishu?.app_secret;

// UAT 写入路径：按平台自动检测，config.json 中可覆盖（仅非标准平台需要）
const PLATFORM_DEFAULTS = {
  kiro: { path: path.join(HOME, '.kiro', 'settings', 'mcp.json'), jsonPath: 'mcpServers.feishu.headers.X-Lark-MCP-UAT' },
  cursor: { path: path.join(HOME, '.cursor', 'mcp.json'), jsonPath: 'mcpServers.feishu.headers.X-Lark-MCP-UAT' },
  claude: { path: path.join(HOME, '.claude.json'), jsonPath: 'mcpServers.feishu.headers.X-Lark-MCP-UAT' },
};

function detectPlatform() {
  if (process.env.CLAUDECODE === '1') return 'claude';
  // Kiro 为默认平台
  return 'kiro';
}

const platform = detectPlatform();
const defaults = PLATFORM_DEFAULTS[platform];
const UAT_CONFIG_PATH = resolvePath(_cfg.feishu?.uat_config_path) || defaults.path;
const UAT_JSON_PATH = _cfg.feishu?.uat_json_path || defaults.jsonPath;

if (!APP_ID || !APP_SECRET || APP_ID.startsWith('在此')) {
  console.error('  错误: config.json 中 feishu.app_id 或 feishu.app_secret 未配置');
  console.error(`  请编辑 ${CONFIG_PATH} 填写你的飞书应用凭证`);
  process.exit(1);
}

const REDIRECT_URI = 'http://localhost:8080/callback';
const CALLBACK_PORT = 8080;
const OAUTH_TIMEOUT = 120_000;
const SCOPES = [
  'docx:document:readonly', 'docx:document:create', 'docx:document:write_only',
  'search:docs:read', 'wiki:wiki:readonly', 'wiki:wiki', 'wiki:node:create',
  'contact:user:search', 'contact:user.base:readonly',
  'docs:document.comment:read', 'docs:document.comment:create',
  'board:whiteboard:node:create', 'board:whiteboard:node:read', 'board:whiteboard:node:update',
].join(' ');

// ============ HTTPS 请求 ============
function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`Invalid JSON: ${data.substring(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    if (body !== undefined) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

// ============ 飞书 API ============
async function getAppAccessToken() {
  const result = await httpsRequest({
    hostname: 'open.feishu.cn', path: '/open-apis/auth/v3/app_access_token/internal',
    method: 'POST', headers: { 'Content-Type': 'application/json' },
  }, { app_id: APP_ID, app_secret: APP_SECRET });

  if (!result.app_access_token) {
    throw new Error(`获取 app_access_token 失败: ${result.message || JSON.stringify(result)}`);
  }
  return result.app_access_token;
}

async function validateUAT(uat) {
  try {
    const result = await httpsRequest({
      hostname: 'open.feishu.cn', path: '/open-apis/authen/v1/user_info',
      method: 'GET', headers: { Authorization: `Bearer ${uat}` },
    });
    return result.code === 0;
  } catch { return false; }
}

async function refreshUAT(appAccessToken, refreshToken) {
  const result = await httpsRequest({
    hostname: 'open.feishu.cn', path: '/open-apis/authen/v1/oidc/refresh_access_token',
    method: 'POST',
    headers: { Authorization: `Bearer ${appAccessToken}`, 'Content-Type': 'application/json' },
  }, { grant_type: 'refresh_token', refresh_token: refreshToken });

  if (result.code !== 0 || !result.data?.access_token) {
    throw new Error(result.message || JSON.stringify(result));
  }
  return { accessToken: result.data.access_token, refreshToken: result.data.refresh_token };
}

async function exchangeCodeForUAT(appAccessToken, code) {
  const result = await httpsRequest({
    hostname: 'open.feishu.cn', path: '/open-apis/authen/v1/oidc/access_token',
    method: 'POST',
    headers: { Authorization: `Bearer ${appAccessToken}`, 'Content-Type': 'application/json' },
  }, { grant_type: 'authorization_code', code });

  if (result.code !== 0 || !result.data?.access_token) {
    throw new Error(result.message || JSON.stringify(result));
  }
  return { accessToken: result.data.access_token, refreshToken: result.data.refresh_token };
}

// ============ UAT 配置文件读写 ============
function getByPath(obj, pathStr) {
  return pathStr.split('.').reduce((o, k) => o?.[k], obj);
}

function setByPath(obj, pathStr, value) {
  const keys = pathStr.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => {
    if (o[k] === undefined) o[k] = {};
    return o[k];
  }, obj);
  target[last] = value;
}

function readCurrentUAT() {
  try {
    const config = JSON.parse(fs.readFileSync(UAT_CONFIG_PATH, 'utf-8'));
    return getByPath(config, UAT_JSON_PATH) || null;
  } catch { return null; }
}

function updateUATConfig(newUAT) {
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(UAT_CONFIG_PATH, 'utf-8'));
  } catch {}

  if (!getByPath(config, UAT_JSON_PATH)) {
    throw new Error(`${UAT_CONFIG_PATH} 中未找到路径 ${UAT_JSON_PATH} 对应的配置`);
  }
  setByPath(config, UAT_JSON_PATH, newUAT);
  fs.writeFileSync(UAT_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

// ============ Token 持久化（refresh_token）============
function loadTokenStore() {
  try {
    if (fs.existsSync(TOKEN_STORE_PATH)) {
      return JSON.parse(fs.readFileSync(TOKEN_STORE_PATH, 'utf-8'));
    }
  } catch {}
  return {};
}

function saveTokenStore(data) {
  fs.writeFileSync(TOKEN_STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ============ OAuth 本地回调服务器 ============
function startOAuthFlow() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      if (parsedUrl.query.code) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>✓ 授权成功！</h1><p>可以关闭此窗口</p>');
        server.close();
        resolve(parsedUrl.query.code);
      } else {
        res.writeHead(200);
        res.end();
      }
    });

    server.listen(CALLBACK_PORT, () => {
      const authUrl = `https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;

      console.log('\n  请在浏览器中完成授权...\n');

      // 自动打开浏览器
      const cmd = process.platform === 'win32' ? `start "" "${authUrl}"`
                : process.platform === 'darwin' ? `open "${authUrl}"`
                : `xdg-open "${authUrl}"`;
      exec(cmd, (err) => {
        if (err) console.log('  无法自动打开浏览器，请手动访问:\n  ' + authUrl);
      });
    });

    const timer = setTimeout(() => {
      server.close();
      reject(new Error('授权超时（120秒）'));
    }, OAUTH_TIMEOUT);

    server.on('close', () => clearTimeout(timer));
  });
}

// ============ MCP 进程重启 ============
function restartFeishuMCP() {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      // Windows: 通过 WMIC 查找飞书 MCP node 进程并 kill
      exec('wmic process where "CommandLine like \'%feishu%mcp%\' and Name=\'node.exe\'" call terminate', (err, stdout) => {
        if (err) {
          // fallback: 用 taskkill 按命令行特征查找
          exec('for /f "tokens=2" %a in (\'wmic process where "CommandLine like \'%feishu%mcp%\' and Name=\'node.exe\'" get ProcessId /value ^| findstr ProcessId\') do taskkill /PID %a /F', (err2) => {
            resolve(!err2);
          });
        } else {
          resolve(true);
        }
      });
    } else {
      // macOS/Linux: pkill 按命令行特征
      exec('pkill -f "feishu.*mcp" 2>/dev/null || pkill -f "lark-mcp" 2>/dev/null', (err) => {
        resolve(!err);
      });
    }
  });
}

// ============ 保存结果 ============
function saveTokens(tokens) {
  // 写入 UAT 配置文件
  updateUATConfig(tokens.accessToken);

  // 持久化 refresh_token
  saveTokenStore({
    refreshToken: tokens.refreshToken,
    updatedAt: new Date().toISOString(),
  });

  // 复制到剪贴板
  try {
    const cmd = process.platform === 'win32' ? `echo|set /p="${tokens.accessToken}"|clip`
              : process.platform === 'darwin' ? `echo -n "${tokens.accessToken}" | pbcopy`
              : `echo -n "${tokens.accessToken}" | xclip -selection clipboard`;
    exec(cmd, () => {});
  } catch {}
}

// ============ 主流程 ============
async function main() {
  const force = process.argv.includes('--force');

  console.log('=== 飞书 UAT 自动刷新 ===\n');

  // Step 1: 检查当前 token
  if (!force) {
    const currentUAT = readCurrentUAT();
    if (currentUAT) {
      process.stdout.write('  [1/3] 检查当前 token... ');
      const isValid = await validateUAT(currentUAT);
      if (isValid) {
        console.log('有效，无需刷新');
        return;
      }
      console.log('已过期');
    } else {
      console.log('  [1/3] 未找到当前 token');
    }
  } else {
    console.log('  [1/3] 强制重新授权');
  }

  // Step 2: 尝试 refresh_token
  const tokenStore = loadTokenStore();
  if (!force && tokenStore.refreshToken) {
    process.stdout.write('  [2/3] 尝试 refresh_token 刷新... ');
    try {
      const appAccessToken = await getAppAccessToken();
      const tokens = await refreshUAT(appAccessToken, tokenStore.refreshToken);
      saveTokens(tokens);
      console.log('成功！');
      console.log(`\n  新 UAT: ${tokens.accessToken.substring(0, 20)}...`);
      console.log(`  已更新 ${UAT_CONFIG_PATH}`);
      await restartFeishuMCP();
      console.log('  已重启飞书 MCP 进程\n');
      return;
    } catch (e) {
      console.log(`失败（${e.message}）`);
    }
  } else {
    console.log('  [2/3] 跳过（无 refresh_token 或强制模式）');
  }

  // Step 3: OAuth 授权流程
  console.log('  [3/3] 启动 OAuth 授权流程...');
  try {
    const code = await startOAuthFlow();
    console.log('  获取到授权码');

    const appAccessToken = await getAppAccessToken();
    const tokens = await exchangeCodeForUAT(appAccessToken, code);
    saveTokens(tokens);

    console.log('  授权成功！');
    console.log(`\n  新 UAT: ${tokens.accessToken.substring(0, 20)}...`);
    console.log('  已更新 MCP 配置文件');
    await restartFeishuMCP();
    console.log('  已重启飞书 MCP 进程\n');
  } catch (e) {
    console.error(`\n  授权失败: ${e.message}\n`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error(`\n  错误: ${e.message}\n`);
  process.exit(1);
});
