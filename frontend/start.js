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

    // Timeout if process doesn't start within 120 seconds (increased from 60)
    setTimeout(() => {
      reject(new Error(`${processName} startup timed out after 120 seconds\nOutput: ${output}`));
    }, 120000);
  });
}

function startBackendServer() {
  return new Promise((resolve) => {
    function spawnBackend() {
      const backend = spawn('npx', ['ts-node', 'backend/src/index.js']);

      backend.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
        if (data.includes('Backend server is running')) {
          log('Backend server started successfully', '✅');
          resolve(backend);
        }
      });

      backend.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
      });

      backend.on('exit', (code, signal) => {
        log(`Backend exited with code ${code} and signal ${signal}`, '💥');
        log('Restarting backend server...', '🔄');
        spawnBackend();
      });
    }

    spawnBackend();
  });
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
  return new Promise((resolve) => {
    const nextApp = spawn('npm', ['run', 'dev']);
    
    nextApp.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      if (data.includes('ready')) {
        log('Next.js app started successfully', '✅');
        resolve(nextApp);
      }
    });

    nextApp.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data}`);
    });

    nextApp.on('error', (error) => {
      log(`Failed to start Next.js app: ${error}`, '❌');
    });
  });
}

async function startup() {
  let backendServer, nextApp;

  try {
    backendServer = await startBackendServer();
    await checkServerHealth();

    // Start Next.js app without waiting for it to be ready
    nextApp = startNextJsApp();
    
    // Keep the script running
    process.stdin.resume();

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