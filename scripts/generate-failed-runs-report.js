const fs = require('fs');
const path = require('path');
const https = require('https');
const AdmZip = require('adm-zip');

// Read failed runs JSON
const failedRunsData = JSON.parse(fs.readFileSync('failed_runs.json', 'utf8'));
const workflowRuns = failedRunsData.workflow_runs;

/**
 * Download file from URL
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/**
 * Extract last error message from log text
 */
function extractLastError(logText) {
  // Look for error patterns in the log
  const lines = logText.split('\n').reverse(); // Start from bottom

  // Patterns to look for errors
  const errorPatterns = [
    /error[:\-]/i,
    /failed[:\-]/i,
    /exit code[:\-]\s*[^0]/i,
    /process.*exited.*[^0]/i,
    /exception[:\-]/i
  ];

  const foundErrors = [];

  for (const line of lines) {
    for (const pattern of errorPatterns) {
      if (pattern.test(line)) {
        foundErrors.push(line.trim());
        if (foundErrors.length >= 5) break; // Limit to first 5 errors
      }
    }
    if (foundErrors.length >= 5) break;
  }

  return foundErrors.length > 0 ? foundErrors : ['Failed run - no specific error details found'];
}

/**
 * Process a single failed run
 */
async function processRun(run) {
  const runId = run.id;
  console.log(`Processing run ${runId}: ${run.display_title}`);

  const logsUrl = run.logs_url;
  const zipPath = path.join('/tmp', `${runId}.zip`);
  const extractPath = path.join('/tmp', `logs-${runId}`);

  try {
    // Download logs zip
    await downloadFile(logsUrl, zipPath);

    // Extract zip
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    // Find log files
    const logFiles = [];
    function scanDir(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (file.endsWith('.txt')) {
          logFiles.push(fullPath);
        }
      }
    }
    scanDir(extractPath);

    let allLogsText = '';
    for (const logFile of logFiles) {
      try {
        const content = fs.readFileSync(logFile, 'utf8');
        allLogsText += `\n=== ${path.basename(logFile)} ===\n${content}`;
      } catch (e) {
        // Skip files that can't be read
      }
    }

    const errors = extractLastError(allLogsText);

    // Clean up
    try {
      fs.unlinkSync(zipPath);
      fs.rmSync(extractPath, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }

    return {
      runId,
      displayTitle: run.display_title,
      createdAt: new Date(run.created_at).toISOString(),
      htmlUrl: run.html_url,
      conclusion: run.conclusion,
      errors: errors.join('\n').substring(0, 1000) // Limit length
    };

  } catch (error) {
    console.error(`Error processing run ${runId}:`, error.message);

    // Clean up on error
    try {
      if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
      if (fs.existsSync(extractPath)) fs.rmSync(extractPath, { recursive: true, force: true });
    } catch (e) {}

    return {
      runId,
      displayTitle: run.display_title,
      createdAt: new Date(run.created_at).toISOString(),
      htmlUrl: run.html_url,
      conclusion: run.conclusion,
      errors: [`Log download failed: ${error.message}`]
    };
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`Processing ${workflowRuns.length} failed workflow runs...`);

  const results = [];
  for (let i = 0; i < workflowRuns.length; i++) {
    const run = workflowRuns[i];
    console.log(`[${i + 1}/${workflowRuns.length}] Processing run ${run.id}`);

    try {
      const result = await processRun(run);
      results.push(result);

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Unexpected error processing run ${run.id}:`, error);
      results.push({
        runId: run.id,
        displayTitle: run.display_title,
        createdAt: new Date(run.created_at).toISOString(),
        htmlUrl: run.html_url,
        conclusion: run.conclusion,
        errors: [`Unexpected error: ${error.message}`]
      });
    }
  }

  // Generate Markdown
  let markdown = '# Failed Workflow Runs\n';

  for (const result of results) {
    markdown += `\n## Run ${result.runId}\n`;
    markdown += `- **Date**: ${result.createdAt}\n`;
    markdown += `- **URL**: ${result.htmlUrl}\n`;
    markdown += `- **Conclusion**: ${result.conclusion}\n`;
    markdown += `\n### Full Logs\n`;
    markdown += '```\n';
    markdown += result.errors;
    markdown += '\n```\n';
  }

  // Write to file
  fs.writeFileSync('failed_runs.md', markdown);
  console.log('Report generated: failed_runs.md');
}

// Run the script
main().catch(console.error);
