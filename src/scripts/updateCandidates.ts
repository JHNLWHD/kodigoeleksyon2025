// Script to update candidate data from Rappler
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { senatorCandidates } from '../lib/candidateData/senators';
import {
  scrapeRapplerSenatorData, 
  scrapeSpecificCandidate, 
  scrapeCandidateProfile
} from '../lib/scrapers/rappler';
import { Candidate } from '../lib/positions';
import { chromium } from 'playwright';

// Get directory name for current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Updates candidate data based on scraped info from Rappler
 * @param filter Optional candidate name to filter by
 */
async function updateCandidateData(filter?: string): Promise<void> {
  console.log('Starting to update candidate data from Rappler...');
  
  try {
    // If a filter is provided, find that candidate
    let candidatesToUpdate: Candidate[] = senatorCandidates;
    if (filter) {
      const normalizedFilter = filter.toLowerCase();
      candidatesToUpdate = senatorCandidates.filter(c => 
        c.name.toLowerCase().includes(normalizedFilter)
      );
      
      if (candidatesToUpdate.length === 0) {
        console.log(`No candidates found matching filter: ${filter}`);
        console.log('Available candidates:');
        senatorCandidates.forEach(c => console.log(`- ${c.name}`));
        return;
      }
      
      console.log(`Found ${candidatesToUpdate.length} candidates matching filter "${filter}":`);
      candidatesToUpdate.forEach(c => console.log(`- ${c.name}`));
    }
    
    // Enhance existing data with information from Rappler
    let enhancedCandidates: Candidate[];
    
    if (filter) {
      // For targeted scraping, first try specific candidate scraper for direct URL access
      enhancedCandidates = [...senatorCandidates]; // Copy array
      
      for (const candidate of candidatesToUpdate) {
        console.log(`Attempting to scrape specific data for: ${candidate.name}`);
        
        // Try to scrape using the specific candidate function
        const specificResult = await scrapeSpecificCandidate(candidate.name);
        
        if (specificResult) {
          console.log(`Successfully scraped specific data for ${candidate.name}`);
          // Find the candidate in the enhancedCandidates array and update it
          const index = enhancedCandidates.findIndex(c => c.id === candidate.id);
          if (index !== -1) {
            enhancedCandidates[index] = {
              ...enhancedCandidates[index],
              // Always use new data, fall back to existing only if new data is missing
              bio: specificResult.bio !== undefined ? specificResult.bio : enhancedCandidates[index].bio,
              platform: specificResult.platform !== undefined ? specificResult.platform : enhancedCandidates[index].platform,
              achievements: specificResult.achievements !== undefined ? specificResult.achievements : enhancedCandidates[index].achievements,
              image: specificResult.image !== undefined ? specificResult.image : enhancedCandidates[index].image,
              profileUrl: specificResult.profileUrl !== undefined ? specificResult.profileUrl : enhancedCandidates[index].profileUrl
            };
          }
        } else {
          // If specific scraper failed, fall back to general scraper
          console.log(`Specific scraper failed for ${candidate.name}, trying general scraper...`);
          const scrapedData = await scrapeRapplerSenatorData(candidate.name);
          
          if (scrapedData.length > 0) {
            const scrapedCandidate = scrapedData[0]; // Just use the first match
            const index = enhancedCandidates.findIndex(c => c.id === candidate.id);
            
            if (index !== -1) {
              enhancedCandidates[index] = {
                ...enhancedCandidates[index],
                // Always use new data, fall back to existing only if new data is missing
                bio: scrapedCandidate.bio !== undefined ? scrapedCandidate.bio : enhancedCandidates[index].bio,
                platform: scrapedCandidate.platform !== undefined ? scrapedCandidate.platform : enhancedCandidates[index].platform,
                achievements: scrapedCandidate.achievements !== undefined ? scrapedCandidate.achievements : enhancedCandidates[index].achievements,
                image: scrapedCandidate.image !== undefined ? scrapedCandidate.image : enhancedCandidates[index].image,
                profileUrl: scrapedCandidate.profileUrl !== undefined ? scrapedCandidate.profileUrl : enhancedCandidates[index].profileUrl
              };
            }
          }
        }
      }
    } else {
      // For all candidates, use direct scraping
      enhancedCandidates = [...senatorCandidates]; // Copy array
      
      // First, get all candidates with profile URLs from Rappler
      console.log('Scraping all candidate profiles from Rappler...');
      const scrapedCandidates = await scrapeRapplerSenatorData();
      console.log(`Found ${scrapedCandidates.length} candidates from Rappler`);
      
      // Process candidates with profile URLs
      for (const candidate of enhancedCandidates) {
        // Try to find a matching scraped candidate
        const scrapedCandidate = findMatchingCandidate(candidate, scrapedCandidates);
        
        if (scrapedCandidate && scrapedCandidate.profileUrl) {
          console.log(`Found profile URL for ${candidate.name}: ${scrapedCandidate.profileUrl}`);
          
          // Create a browser instance and scrape the profile directly
          const browser = await chromium.launch({ headless: true });
          try {
            const candidateDetail = await scrapeCandidateProfile(browser, scrapedCandidate.profileUrl, candidate.name);
            
            // Update the candidate with the scraped data
            const index = enhancedCandidates.findIndex(c => c.id === candidate.id);
            if (index !== -1) {
              enhancedCandidates[index] = {
                ...enhancedCandidates[index],
                // Always use new data, fall back to existing only if new data is missing
                bio: candidateDetail.bio !== undefined ? candidateDetail.bio : enhancedCandidates[index].bio,
                platform: candidateDetail.platform !== undefined ? candidateDetail.platform : enhancedCandidates[index].platform,
                achievements: candidateDetail.achievements !== undefined ? candidateDetail.achievements : enhancedCandidates[index].achievements,
                image: candidateDetail.image !== undefined ? candidateDetail.image : enhancedCandidates[index].image,
                profileUrl: candidateDetail.profileUrl !== undefined ? candidateDetail.profileUrl : scrapedCandidate.profileUrl
              };
              
              console.log(`Successfully updated ${candidate.name} with data from profile URL`);
            }
          } catch (error) {
            console.error(`Error scraping profile URL for ${candidate.name}:`, error);
          } finally {
            await browser.close();
          }
        }
      }
      
      console.log('Using general enhancement function for remaining candidates');
    }
    
    // Create a backup of the original file
    const backupPath = join(dirname(dirname(__dirname)), 'src/lib/candidateData/senators.backup.ts');
    console.log(`Creating backup at ${backupPath}`);
    writeFileSync(backupPath, readFileSync(join(dirname(dirname(__dirname)), 'src/lib/candidateData/senators.ts'), 'utf8'));
    
    // Format the candidates data as a TypeScript file
    const candidatesFileContent = `
// This file was generated by updateCandidates.ts script
import { Candidate } from '../positions';

export const senatorCandidates: Candidate[] = ${JSON.stringify(enhancedCandidates, null, 2)};
`;
    
    // Write the updated data back to the file
    const filePath = join(dirname(dirname(__dirname)), 'src/lib/candidateData/senators.ts');
    console.log(`Writing updated data to ${filePath}`);
    writeFileSync(filePath, candidatesFileContent);
    
    console.log('Successfully updated senator candidates data!');
  } catch (error) {
    console.error('Error updating candidate data:', error);
  }
}

// Check if this file is being run directly
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  console.log('Running script in standalone mode');
  
  // Check for filter in environment variable
  const filter = process.env.CANDIDATE_FILTER;
  if (filter) {
    console.log(`Filtering by candidate name: ${filter}`);
  }
  
  updateCandidateData(filter)
    .catch(console.error)
    .finally(() => {
      console.log('Script execution completed, shutting down...');
      process.exit(0);
    });
} else {
  console.log('Script loaded as a module');
}

export { updateCandidateData };

// Helper function to find matching candidate by name
function findMatchingCandidate(candidate: Candidate, scrapedCandidates: Partial<Candidate>[]): Partial<Candidate> | undefined {
  // Normalize the candidate name for better matching
  const normalizedName = normalizeNameForComparison(candidate.name);
  
  // First try exact match
  let match = scrapedCandidates.find(sc => 
    sc.name && normalizeNameForComparison(sc.name) === normalizedName
  );
  
  if (!match) {
    // Try partial match
    match = scrapedCandidates.find(sc => 
      sc.name && (
        normalizeNameForComparison(sc.name).includes(normalizedName) || 
        normalizedName.includes(normalizeNameForComparison(sc.name))
      )
    );
  }
  
  return match;
}

// Helper function to normalize names for comparison
function normalizeNameForComparison(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
} 