#!/usr/bin/env ts-node

/**
 * CLI script to run the Rappler scraper
 * Usage: ts-node src/scripts/scrape.ts [--name CANDIDATE_NAME] [--all] [--help]
 */
import { updateCandidateData } from './updateCandidates';
import { checkEnvironment } from './check-env';

// Parse command line arguments
const args = process.argv.slice(2);
let candidateName = '';
let scrapeAll = false;
let showHelp = false;
let skipChecks = false;

// Parse args
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--name' && i + 1 < args.length) {
    candidateName = args[i + 1];
    i++; // Skip the next arg
  } else if (args[i] === '--all') {
    scrapeAll = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    showHelp = true;
  } else if (args[i] === '--skip-checks') {
    skipChecks = true;
  }
}

if (showHelp) {
  console.log(`
Rappler Candidate Scraper

Usage: ts-node src/scripts/scrape.ts [options]

Options:
  --name NAME    Scrape data only for the candidate with the specified name
  --all          Scrape data for all candidates (default)
  --skip-checks  Skip environment checks
  --help, -h     Show this help message

Examples:
  ts-node src/scripts/scrape.ts --name "ABALOS, BENHUR"
  ts-node src/scripts/scrape.ts --all
  `);
  process.exit(0);
}

console.log('Running Rappler candidate scraper...');
if (candidateName) {
  console.log(`Filtering for candidate: ${candidateName}`);
}

// Run the scraper with the provided filter
async function runScraper() {
  try {
    // Check environment if not skipped
    if (!skipChecks) {
      const envReady = await checkEnvironment();
      if (!envReady) {
        console.error('Environment checks failed. Please fix the issues before running the scraper.');
        console.log('To skip checks, run with --skip-checks');
        process.exit(1);
      }
    }
    
    await updateCandidateData(candidateName || undefined);
    console.log('Scraping complete!');
  } catch (error) {
    console.error('Error running scraper:', error);
    process.exit(1);
  }
}

runScraper(); 