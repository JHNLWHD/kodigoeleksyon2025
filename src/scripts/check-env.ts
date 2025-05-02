/**
 * Utility script to check that the environment is properly set up
 */

import { chromium } from 'playwright';

// Check that Playwright is installed and working
async function checkPlaywright() {
  console.log('Checking Playwright installation...');
  try {
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    console.log('✅ Playwright is working correctly');
    return true;
  } catch (error) {
    console.error('❌ Error with Playwright:', error.message);
    console.log('You may need to install browser binaries using: npx playwright install chromium');
    return false;
  }
}

// Run environment checks
async function checkEnvironment() {
  console.log('Checking environment for Rappler scraper');
  
  let success = true;
  
  // Check Node.js version
  const nodeVersion = process.versions.node;
  console.log(`Node.js version: ${nodeVersion}`);
  
  // Check Playwright
  success = await checkPlaywright() && success;
  
  if (success) {
    console.log('\n✅ All checks passed! Environment is ready for scraping.');
  } else {
    console.log('\n❌ Some checks failed. Please fix the issues above before running the scraper.');
  }

  return success;
}

// If this file is being run directly, run the checks
if (process.argv[1] === new URL(import.meta.url).pathname) {
  checkEnvironment().catch(console.error);
}

export { checkEnvironment }; 