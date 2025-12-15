// Simple script to test Render MCP connection
const { spawn } = require('child_process');
const path = require('path');

const renderMcpPath = path.join(__dirname, 'dist', 'index.js');
const child = spawn('node', [renderMcpPath], { stdio: 'pipe' });

let output = '';
child.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString());
});

child.stderr.on('data', (data) => {
  output += data.toString();
  console.log('STDERR:', data.toString());
});

// Send test connection command
setTimeout(() => {
  const command = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'test_render_connection',
      arguments: {}
    }
  }) + '\n';
  
  console.log('Sending command:', command);
  child.stdin.write(command);
}, 1000);

// Send list services command
setTimeout(() => {
  const command = JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'list_services',
      arguments: { limit: 10 }
    }
  }) + '\n';
  
  console.log('Sending command:', command);
  child.stdin.write(command);
}, 2000);

// Wait for response and exit
setTimeout(() => {
  child.kill();
  console.log('Final output:', output);
}, 5000);