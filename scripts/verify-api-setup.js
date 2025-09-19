#!/usr/bin/env node

/**
 * API Setup Verification Script
 * Tests key API endpoints to ensure proper configuration
 * Run with: node scripts/verify-api-setup.js
 */

const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Test results
const results = {
  tests: [],
  passed: 0,
  failed: 0,
  total: 0
};

/**
 * Make HTTP request and return promise
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const req = protocol.request(url, requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            data: JSON.parse(data),
            raw: data
          };
          resolve(response);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            raw: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Run test and record result
 */
function runTest(name, testFn) {
  return new Promise((resolve) => {
    results.total++;

    try {
      testFn().then(() => {
        results.tests.push({ name, status: 'PASS' });
        results.passed++;
        resolve();
      }).catch((error) => {
        results.tests.push({ name, status: 'FAIL', error: error.message });
        results.failed++;
        resolve();
      });
    } catch (error) {
      results.tests.push({ name, status: 'FAIL', error: error.message });
      results.failed++;
      resolve();
    }
  });
}

/**
 * Test endpoint availability
 */
async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`Testing ${name}...`);
    const response = await makeRequest(url, options);

    if (response.status >= 200 && response.status < 300) {
      console.log(`✓ ${name}: ${response.status} ${response.data ? 'OK' : 'No Data'}`);
      return true;
    } else {
      console.log(`✗ ${name}: ${response.status} ${response.data?.error || 'Error'}`);
      return false;
    }
  } catch (error) {
    console.log(`✗ ${name}: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('🚀 Running API Setup Verification...\n');

  // Test 1: Supabase configuration
  await runTest('Supabase URL Configuration', async () => {
    if (!BASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured');
    if (!SUPABASE_ANON_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY not configured');
    return true;
  });

  // Test 2: Health check / general API availability
  await runTest('Basic API Connectivity', async () => {
    const success = await testEndpoint('Health Check', `${BASE_URL}/api/health`);
    if (!success) throw new Error('API is not accessible');
  });

  // Test 3: Auth endpoints (test auth/callback endpoint structure)
  await runTest('Auth Endpoints', async () => {
    const success = await testEndpoint('Auth Callback', `${BASE_URL}/api/auth/callback`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });

    if (success) {
      return true;
    } else {
      // Try without auth
      const success2 = await testEndpoint('Auth Callback (anonymous)', `${BASE_URL}/api/auth/callback`);
      if (!success2) throw new Error('Auth callback endpoint not responding');
    }
  });

  // Test 4: User profile endpoint
  await runTest('User Profile Endpoint', async () => {
    const success = await testEndpoint('User Profile', `${BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });

    if (!success) throw new Error('User profile endpoint not accessible');
  });

  // Test 5: Sites endpoint (read operation)
  await runTest('Sites API Endpoint', async () => {
    const success = await testEndpoint('Sites API', `${BASE_URL}/api/sites`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });

    if (!success) throw new Error('Sites endpoint not responding');
  });

  // Test 6: Jobs endpoint (read operation)
  await runTest('Jobs API Endpoint', async () => {
    const success = await testEndpoint('Jobs API', `${BASE_URL}/api/jobs`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });

    if (!success) throw new Error('Jobs endpoint not responding');
  });

  // Test 7: Leads endpoint (read operation)
  await runTest('Leads API Endpoint', async () => {
    const success = await testEndpoint('Leads API', `${BASE_URL}/api/leads`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });

    if (!success) throw new Error('Leads endpoint not responding');
  });

  // Test 8: Research endpoint (with dummy data)
  await runTest('Research API Endpoint', async () => {
    const testData = {
      niche: 'test',
      targetAudience: 'testers',
      competitorAnalysis: false,
      domainSearch: false
    };

    const success = await testEndpoint('Research API', `${BASE_URL}/api/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: testData
    });

    if (!success) throw new Error('Research endpoint not responding');
  });

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log('');

  results.tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✓' : '✗';
    console.log(`${icon} ${test.name}${test.error ? ' - ' + test.error : ''}`);
  });

  if (results.failed > 0) {
    console.log('\n⚠️ Some tests failed. Check your API configuration and environment variables.');
    console.log('Required environment variables:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  } else {
    console.log('\n🎉 All API endpoints are properly configured and responding!');
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the tests
main().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
