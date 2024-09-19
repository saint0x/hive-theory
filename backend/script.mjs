import axios from 'axios';
import { spawn } from 'child_process';
import chalk from 'chalk';

const BASE_URL = 'http://localhost:3000';
const ENDPOINTS = [
  { method: 'GET', path: '/health', name: 'Health Check' },
  { method: 'GET', path: '/api/sheets', name: 'Get All Spreadsheets' },
  { method: 'GET', path: '/api/slides', name: 'Get All Presentations' },
  { method: 'GET', path: '/api/connections', name: 'Get All Connections' },
  { method: 'POST', path: '/api/connections', name: 'Create Connection', data: {
    sheetId: 'test-sheet-id',
    slideId: 'test-slide-id',
    sheetRange: 'A1:B2',
    slidePageId: 'test-page-id',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    isImage: false
  }},
  { method: 'POST', path: '/api/sync', name: 'Sync All Connections' },
];

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  let formattedMessage;

  switch (type) {
    case 'success':
      formattedMessage = chalk.green(`✅ ${message}`);
      break;
    case 'error':
      formattedMessage = chalk.red(`❌ ${message}`);
      break;
    case 'warning':
      formattedMessage = chalk.yellow(`⚠️ ${message}`);
      break;
    case 'server':
      formattedMessage = chalk.blue(`🖥️ ${message}`);
      break;
    case 'test':
      formattedMessage = chalk.magenta(`🧪 ${message}`);
      break;
    default:
      formattedMessage = chalk.blue(`ℹ️ ${message}`);
  }

  console.log(`[${timestamp}] ${formattedMessage}`);
}

function startServer() {
  return new Promise((resolve, reject) => {
    log('Attempting to start server...', 'server');
    const server = spawn('npm', ['start'], { stdio: 'pipe' });

    server.stdout.on('data', (data) => {
      const output = data.toString().trim();
      log(`Server output: ${output}`, 'server');
      if (output.includes('Server started')) {
        log('Server started successfully!', 'success');
        resolve(server);
      }
    });

    server.stderr.on('data', (data) => {
      log(`Server error: ${data}`, 'error');
    });

    server.on('error', (error) => {
      log(`Failed to start server: ${error.message}`, 'error');
      reject(error);
    });

    setTimeout(() => {
      log('Server start timeout reached', 'warning');
      reject(new Error('Server start timeout'));
    }, 30000); // Increased timeout to 30 seconds
  });
}

async function testEndpoint(endpoint) {
  log(`Testing endpoint: ${endpoint.name} (${endpoint.method} ${endpoint.path})`, 'test');
  try {
    const startTime = Date.now();
    const response = await axios({
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.path}`,
      data: endpoint.data,
    });
    const duration = Date.now() - startTime;

    log(`${endpoint.name} - Status: ${response.status} - Duration: ${duration}ms`, 'success');
    log(`Response data: ${JSON.stringify(response.data, null, 2)}`, 'info');
  } catch (error) {
    log(`${endpoint.name} - Error: ${error.message}`, 'error');
    if (error.response) {
      log(`Response status: ${error.response.status}`, 'error');
      log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
    }
  }
}

async function runTests() {
  let server;
  try {
    log('🚀 Starting test suite', 'test');
    server = await startServer();

    for (const endpoint of ENDPOINTS) {
      await testEndpoint(endpoint);
    }

    log('🎉 All tests completed', 'success');
  } catch (error) {
    log(`🚨 Test suite error: ${error.message}`, 'error');
  } finally {
    if (server) {
      server.kill();
      log('🛑 Server stopped', 'server');
    }
  }
}

runTests();