const { spawn } = require('child_process');
const path = require('path');

console.log('Starting MCP Servers...');

// サーバー設定
const servers = [
  {
    name: 'Google Calendar MCP',
    script: 'google-calendar-mcp.js',
    port: 8084
  },
  {
    name: 'Google Calendar MCP (Real)',
    script: 'google-calendar-mcp-real.js',
    port: 8087
  },
  {
    name: 'AI Service MCP',
    script: 'ai-service-mcp.js',
    port: 8085
  },
  {
    name: 'Enhanced AI MCP',
    script: 'enhanced-ai-mcp.js',
    port: 8086
  }
];

const processes = [];

// 各サーバーを起動
servers.forEach((server, index) => {
  setTimeout(() => {
    console.log(`Starting ${server.name} on port ${server.port}...`);
    
    const serverProcess = spawn('node', [server.script], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    serverProcess.on('error', (error) => {
      console.error(`Error starting ${server.name}:`, error);
    });
    
    serverProcess.on('exit', (code) => {
      console.log(`${server.name} exited with code ${code}`);
    });
    
    processes.push({
      name: server.name,
      process: serverProcess
    });
    
  }, index * 2000); // 2秒間隔で起動
});

// 終了処理
process.on('SIGINT', () => {
  console.log('\nShutting down MCP servers...');
  
  processes.forEach(({ name, process }) => {
    console.log(`Stopping ${name}...`);
    process.kill('SIGINT');
  });
  
  setTimeout(() => {
    console.log('All servers stopped.');
    process.exit(0);
  }, 2000);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down...');
  
  processes.forEach(({ name, process }) => {
    console.log(`Stopping ${name}...`);
    process.kill('SIGTERM');
  });
  
  setTimeout(() => {
    process.exit(0);
  }, 2000);
});

console.log('\nMCP Servers are starting...');
console.log('Press Ctrl+C to stop all servers');
console.log('\nServer endpoints:');
servers.forEach(server => {
  console.log(`- ${server.name}: ws://localhost:${server.port}/mcp/*`);
});