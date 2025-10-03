#!/usr/bin/env node

/**
 * Auth Setup Verification Script
 *
 * This script verifies that your authentication setup is configured correctly.
 * Run this before testing OAuth to catch common configuration issues.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkmark() {
  return `${colors.green}✓${colors.reset}`;
}

function crossmark() {
  return `${colors.red}✗${colors.reset}`;
}

function warning() {
  return `${colors.yellow}⚠${colors.reset}`;
}

// Check if .env.local exists and has required variables
function checkEnvFile() {
  log('\n📋 Checking Environment Variables...', 'cyan');

  const envPath = path.join(path.dirname(__dirname), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log(`${crossmark()} .env.local file not found`, 'red');
    log('   Create .env.local from .env.example', 'yellow');
    return false;
  }
  
  log(`${checkmark()} .env.local file exists`);
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_SITE_URL',
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    if (regex.test(envContent)) {
      // Check if it's not a placeholder
      const match = envContent.match(new RegExp(`^${varName}=(.+)`, 'm'));
      if (match && match[1] && !match[1].includes('your_') && match[1].trim() !== '') {
        log(`${checkmark()} ${varName} is set`);
      } else {
        log(`${warning()} ${varName} appears to be a placeholder`, 'yellow');
        allPresent = false;
      }
    } else {
      log(`${crossmark()} ${varName} is missing`, 'red');
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Check if auth routes exist
function checkAuthRoutes() {
  log('\n🛣️  Checking Auth Routes...', 'cyan');

  const routes = [
    'src/app/auth/login/page.tsx',
    'src/app/auth/signup/page.tsx',
    'src/app/auth/callback/page.tsx',
    'src/app/api/auth/callback/route.ts',
  ];

  let allExist = true;

  routes.forEach(route => {
    const routePath = path.join(path.dirname(__dirname), route);
    if (fs.existsSync(routePath)) {
      log(`${checkmark()} ${route} exists`);
    } else {
      log(`${crossmark()} ${route} is missing`, 'red');
      allExist = false;
    }
  });
  
  return allExist;
}

// Check if Supabase client is configured
function checkSupabaseConfig() {
  log('\n🔧 Checking Supabase Configuration...', 'cyan');

  const clientPath = path.join(path.dirname(__dirname), 'src/lib/supabase/client.ts');
  const serverPath = path.join(path.dirname(__dirname), 'src/lib/supabase-server.ts');
  
  let allExist = true;
  
  if (fs.existsSync(clientPath)) {
    log(`${checkmark()} Supabase client configuration exists`);
  } else {
    log(`${crossmark()} Supabase client configuration is missing`, 'red');
    allExist = false;
  }
  
  if (fs.existsSync(serverPath)) {
    log(`${checkmark()} Supabase server configuration exists`);
  } else {
    log(`${crossmark()} Supabase server configuration is missing`, 'red');
    allExist = false;
  }
  
  return allExist;
}

// Check if auth store is configured
function checkAuthStore() {
  log('\n📦 Checking Auth Store...', 'cyan');

  const storePath = path.join(path.dirname(__dirname), 'src/stores/auth.ts');
  
  if (!fs.existsSync(storePath)) {
    log(`${crossmark()} Auth store is missing`, 'red');
    return false;
  }
  
  log(`${checkmark()} Auth store exists`);
  
  const storeContent = fs.readFileSync(storePath, 'utf8');
  
  const requiredMethods = [
    'signInWithGoogle',
    'signInWithFacebook',
    'signInWithGithub',
    'signIn',
    'signUp',
    'signOut',
  ];
  
  let allPresent = true;
  
  requiredMethods.forEach(method => {
    if (storeContent.includes(method)) {
      log(`${checkmark()} ${method} method exists`);
    } else {
      log(`${crossmark()} ${method} method is missing`, 'red');
      allPresent = false;
    }
  });
  
  // Check if redirectTo is configured correctly
  if (storeContent.includes('redirectTo:') && storeContent.includes('/auth/callback')) {
    log(`${checkmark()} OAuth redirectTo is configured`);
  } else {
    log(`${warning()} OAuth redirectTo might not be configured correctly`, 'yellow');
  }
  
  return allPresent;
}

// Check if middleware is configured
function checkMiddleware() {
  log('\n🛡️  Checking Middleware...', 'cyan');

  const middlewarePath = path.join(path.dirname(__dirname), 'middleware.ts');
  
  if (!fs.existsSync(middlewarePath)) {
    log(`${warning()} middleware.ts not found (optional)`, 'yellow');
    return true;
  }
  
  log(`${checkmark()} middleware.ts exists`);
  
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  // Check if auth routes are excluded from middleware
  if (middlewareContent.includes('/auth/') || middlewareContent.includes('auth')) {
    log(`${checkmark()} Middleware appears to handle auth routes`);
  } else {
    log(`${warning()} Middleware might not be configured for auth routes`, 'yellow');
  }
  
  return true;
}

// Provide setup instructions
function provideInstructions(allChecks) {
  log('\n' + '='.repeat(60), 'blue');
  
  if (allChecks) {
    log('\n✅ All checks passed!', 'green');
    log('\nNext steps:', 'cyan');
    log('1. Start the development server: npm run dev');
    log('2. Configure OAuth providers in Supabase Dashboard');
    log('3. Test the authentication flow');
    log('\nFor detailed setup instructions, see:');
    log('   docs/AUTH_SETUP_GUIDE.md', 'yellow');
  } else {
    log('\n❌ Some checks failed', 'red');
    log('\nPlease fix the issues above before proceeding.', 'yellow');
    log('\nFor help, see:');
    log('   docs/AUTH_SETUP_GUIDE.md', 'yellow');
  }
  
  log('\n' + '='.repeat(60), 'blue');
}

// Main execution
function main() {
  log('\n' + '='.repeat(60), 'blue');
  log('🔐 MicroSite Forge - Auth Setup Verification', 'cyan');
  log('='.repeat(60), 'blue');
  
  const checks = [
    checkEnvFile(),
    checkAuthRoutes(),
    checkSupabaseConfig(),
    checkAuthStore(),
    checkMiddleware(),
  ];
  
  const allChecks = checks.every(check => check);
  
  provideInstructions(allChecks);
  
  process.exit(allChecks ? 0 : 1);
}

main();

