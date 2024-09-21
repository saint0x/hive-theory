const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a log file stream
const logStream = fs.createWriteStream(path.join(__dirname, 'startup.log'), { flags: 'a' });

const log = (message, emoji) => {
  const logMessage = `${new Date().toISOString()} ${emoji} ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
};

function spawnProcess(command, args, processName, successMessage) {
  return new Promise((resolve, reject) => {
    log(`Starting ${processName}...`, '🚀');
    const process = spawn(command, args);
    let output = '';

    process.stdout.on('data', (data) => {
      output += data;
      console.log(`${processName}: ${data}`);
      if (data.includes(successMessage)) {
        log(`${processName} started successfully`, '✅');
        resolve(process);
      }
    });

    process.stderr.on('data', (data) => {
      output += data;
      console.error(`${processName} Error: ${data}`);
    });

    process.on('error', (error) => {
      log(`Failed to start ${processName}: ${error}`, '❌');
      reject(new Error(`${processName} failed to start: ${error.message}\nOutput: ${output}`));
    });

    process.on('exit', (code, signal) => {
      if (code !== 0) {
        log(`${processName} exited with code ${code} and signal ${signal}`, '💥');
        reject(new Error(`${processName} exited unexpectedly\nOutput: ${output}`));
      }
    });

    // Timeout if process doesn't start within 60 seconds
    setTimeout(() => {
      reject(new Error(`${processName} startup timed out after 60 seconds\nOutput: ${output}`));
    }, 60000);
  });
}

function startBackendServer() {
  return spawnProcess('npx', ['ts-node', 'backend/src/index.js'], 'Backend', 'Backend server is running');
}

function checkServerHealth(retries = 3, delay = 5000) {
  return new Promise((resolve, reject) => {
    const check = (attemptsLeft) => {
      log(`Checking backend server health (attempts left: ${attemptsLeft})...`, '🏥');
      http.get('http://localhost:3001/health', (res) => {
        if (res.statusCode === 200) {
          log('Backend server is healthy', '💚');
          resolve();
        } else {
          log(`Health check failed with status code: ${res.statusCode}`, '🚨');
          retryOrReject(attemptsLeft);
        }
      }).on('error', (error) => {
        log(`Health check request failed: ${error.message}`, '🚨');
        retryOrReject(attemptsLeft);
      });
    };

    const retryOrReject = (attemptsLeft) => {
      if (attemptsLeft > 1) {
        log(`Retrying health check in ${delay / 1000} seconds...`, '🔄');
        setTimeout(() => check(attemptsLeft - 1), delay);
      } else {
        reject(new Error('Health check failed after multiple attempts'));
      }
    };

    check(retries);
  });
}

function startNextJsApp() {
  return spawnProcess('npm', ['run', 'dev'], 'Next.js', 'ready');
}

async function startup() {
  let backendServer, nextApp;

  try {
    backendServer = await startBackendServer();
    await checkServerHealth();
    nextApp = await startNextJsApp();

    process.on('SIGINT', () => {
      log('Received SIGINT. Shutting down...', '🛑');
      shutdown(backendServer, nextApp);
    });

    process.on('SIGTERM', () => {
      log('Received SIGTERM. Shutting down...', '🛑');
      shutdown(backendServer, nextApp);
    });

    process.on('uncaughtException', (error) => {
      log(`Uncaught Exception: ${error.message}`, '💥');
      shutdown(backendServer, nextApp, 1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, '💥');
      shutdown(backendServer, nextApp, 1);
    });

  } catch (error) {
    log(`Startup failed: ${error.message}`, '💥');
    shutdown(backendServer, nextApp, 1);
  }
}

function shutdown(backendServer, nextApp, exitCode = 0) {
  log('Shutting down applications...', '🔽');

  const killProcess = (proc, name) => {
    if (proc && !proc.killed) {
      log(`Terminating ${name}...`, '🔪');
      proc.kill('SIGTERM');
    }
  };

  killProcess(backendServer, 'Backend Server');
  killProcess(nextApp, 'Next.js App');

  setTimeout(() => {
    log('Shutdown complete', '👋');
    logStream.end(() => {
      process.exit(exitCode);
    });
  }, 5000); // Give processes 5 seconds to clean up before forcing exit
}

startup();