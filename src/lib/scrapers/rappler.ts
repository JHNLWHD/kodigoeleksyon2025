// Rappler Candidate Scraper using Playwright
// This file contains functions to scrape senatorial candidate information from Rappler

import { Candidate } from '../positions';
import { chromium } from 'playwright';

interface CandidateDetail {
  name: string;
  fullName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  alias?: string;
  gender?: string;
  birthdate?: string;
  spouse?: string;
  profession?: string;
  education?: string;
  party: string;
  bio?: string;
  platform?: string;
  achievements?: string;
  image?: string;
  profileUrl?: string;
}

/**
 * Fetches and scrapes senatorial candidate information from Rappler using Playwright
 * @param filter Optional candidate name to filter results
 */
export async function scrapeRapplerSenatorData(filter?: string): Promise<Partial<Candidate>[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  try {
    console.log('Navigating to Rappler elections page...');
    await page.goto('https://ph.rappler.com/elections/2025/senatorial-race', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // Add a wait to ensure the page has loaded
    await page.waitForTimeout(5000);
    
    console.log('Page loaded, extracting candidate data...');
    
    // Debug: Log page structure to understand the page better
    const pageStructure = await page.evaluate(() => {
      // Get all available class names to help identify candidate elements
      const allElements = document.querySelectorAll('*');
      const classNames = new Set<string>();
      
      allElements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          el.className.split(' ').forEach(cls => {
            if (cls.includes('candidate') || cls.includes('Candidate') || 
                cls.includes('pagination') || cls.includes('Pagination')) {
              classNames.add(cls);
            }
          });
        }
      });
      
      // Log specific element counts
      const candidateElementCount = document.querySelectorAll('.senatorialRaceCandidates_candidate__Rg83N').length;
      const paginationElementCount = document.querySelectorAll('.pagination_pagination__L6hK_').length;
      
      // Log HTML structure of main content area
      const mainContent = document.querySelector('main')?.innerHTML || 'No main element found';
      const mainContentSummary = mainContent.substring(0, 1000) + (mainContent.length > 1000 ? '...' : '');
      
      return {
        candidateRelatedClasses: Array.from(classNames),
        candidateElementCount,
        paginationElementCount,
        mainContentSummary,
        title: document.title,
        bodyText: document.body.textContent?.substring(0, 200) || 'No body text'
      };
    });
    
    console.log('Page Structure Debug Info:');
    console.log('- Page Title:', pageStructure.title);
    console.log('- Body Text (first 200 chars):', pageStructure.bodyText);
    console.log('- Candidate Related Classes:', pageStructure.candidateRelatedClasses);
    console.log(`- Candidate Elements Found: ${pageStructure.candidateElementCount}`);
    console.log(`- Pagination Elements Found: ${pageStructure.paginationElementCount}`);
    console.log('- Main Content Summary:', pageStructure.mainContentSummary);
    
    // Extract candidates using the specific class
    let candidateLinks: Array<{name: string, url: string}> = [];
    
    // Process all pages to get all 66 candidates
    let currentPage = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      console.log(`Processing page ${currentPage} of candidates...`);
      
      // Try to find candidate elements with more reliable selectors
      const newCandidates = await page.evaluate(() => {
        const results: Array<{name: string, url: string}> = [];
        
        // Try to find candidate elements with more reliable selectors
        const candidateElements = document.querySelectorAll('a.senatorialRaceCandidates_candidate__Rg83N');
        
        if (candidateElements && candidateElements.length > 0) {
          console.log(`Found ${candidateElements.length} candidates with primary selector`);
          
          candidateElements.forEach(element => {
            // Extract the name from the candidate element
            const nameElement = element.querySelector('.senatorialRaceCandidates_surname___QFSK, .senatorialRaceCandidates_firstName__y_B2R, h3, [class*="name"], [class*="Name"]');
            
            // Get href directly from the anchor element
            let url = '';
            if (element.getAttribute('href')) {
              url = new URL(element.getAttribute('href') || '', 'https://ph.rappler.com').href;
            }
            
            if (nameElement) {
              const name = nameElement.textContent?.trim() || '';
              
              if (name) {
                results.push({ name, url });
              }
            }
          });
        }
        
        return results;
      });
      
      if (newCandidates.length > 0) {
        console.log(`Found ${newCandidates.length} candidates on page ${currentPage}`);
        candidateLinks = [...candidateLinks, ...newCandidates];
        
        // Check if there's a next page button
        const paginationInfo = await page.evaluate(() => {
          // Debug: log all pagination related elements
          const paginationElements = document.querySelectorAll('[class*="pagination"], [class*="Pagination"]');
          const paginationClasses = Array.from(paginationElements).map(el => {
            return {
              className: el.className,
              html: el.innerHTML.substring(0, 200)
            };
          });
          
          // Try the specific class first
          const specificPagination = document.querySelector('.pagination_pagination__L6hK_');
          if (specificPagination) {
            // Find numeric buttons in the pagination
            const pageButtons = Array.from(specificPagination.querySelectorAll('button'))
              .filter(btn => {
                const text = btn.textContent?.trim() || '';
                return !isNaN(parseInt(text, 10)); // Keep only numeric buttons
              });
              
            // Get the current page number (button with active class)
            let currentPageNum = 1;
            const activeButton = specificPagination.querySelector('button[class*="active"]');
            if (activeButton) {
              currentPageNum = parseInt(activeButton.textContent?.trim() || '1', 10);
            }
            
            // Find the next page button (current page + 1)
            const nextPageNum = currentPageNum + 1;
            const nextButton = pageButtons.find(btn => {
              const btnNum = parseInt(btn.textContent?.trim() || '0', 10);
              return btnNum === nextPageNum;
            });
            
            return {
              hasNextPageSpecific: nextButton !== null,
              allPaginationElements: paginationClasses,
              nextButtonFound: nextButton !== null,
              currentPage: currentPageNum,
              nextPage: nextPageNum,
              buttonCount: pageButtons.length
            };
          }
          
          // If specific class not found, look for generic pagination with number buttons
          const paginationContainer = document.querySelector('[class*="pagination"]');
          if (paginationContainer) {
            const pageButtons = Array.from(paginationContainer.querySelectorAll('button, a'))
              .filter(btn => {
                const text = btn.textContent?.trim() || '';
                return !isNaN(parseInt(text, 10)); // Keep only numeric buttons
              });
            
            // Get the current page number (button with active class)
            let currentPageNum = 1;
            const activeButton = paginationContainer.querySelector('button[class*="active"], a[class*="active"]');
            if (activeButton) {
              currentPageNum = parseInt(activeButton.textContent?.trim() || '1', 10);
            }
            
            // Find the next page button (current page + 1)
            const nextPageNum = currentPageNum + 1;
            const nextButton = pageButtons.find(btn => {
              const btnNum = parseInt(btn.textContent?.trim() || '0', 10);
              return btnNum === nextPageNum;
            });
            
            return {
              hasNextPageGeneric: nextButton !== null,
              allPaginationElements: paginationClasses,
              nextButtonFound: nextButton !== null,
              currentPage: currentPageNum,
              nextPage: nextPageNum, 
              buttonCount: pageButtons.length
            };
          }
          
          return {
            hasNextPageSpecific: false,
            hasNextPageGeneric: false,
            allPaginationElements: paginationClasses,
            nextButtonFound: false,
            buttonCount: 0
          };
        });
        
        console.log('Pagination Debug Info:');
        console.log(JSON.stringify(paginationInfo, null, 2));
        
        const hasNextPage = paginationInfo.hasNextPageSpecific || paginationInfo.hasNextPageGeneric;
        
        if (hasNextPage) {
          currentPage++;
          
          // Click the next page button using the page number
          console.log(`Clicking pagination button for page ${paginationInfo.nextPage}`);
          try {
            // Try specific class first
            const nextPageSelector = `.pagination_pagination__L6hK_ button`;
            try {
              // Find and click the button with the target page number
              await page.evaluate((nextPage) => {
                const buttons = Array.from(document.querySelectorAll('.pagination_pagination__L6hK_ button'))
                  .filter(button => button.textContent?.trim() === String(nextPage));
                
                if (buttons.length > 0) {
                  (buttons[0] as HTMLElement).click();
                  return true;
                }
                return false;
              }, paginationInfo.nextPage);
              
              console.log(`Clicked next page button for page ${paginationInfo.nextPage}`);
            } catch (specificError) {
              // If specific selector fails, try a more generic one
              console.log('Specific pagination button selector failed, trying generic selectors');
              
              // Try with generic class
              try {
                await page.evaluate((nextPage) => {
                  const buttons = Array.from(document.querySelectorAll('[class*="pagination"] button, [class*="pagination"] a'))
                    .filter(button => button.textContent?.trim() === String(nextPage));
                  
                  if (buttons.length > 0) {
                    (buttons[0] as HTMLElement).click();
                    return true;
                  }
                  return false;
                }, paginationInfo.nextPage);
                
                console.log(`Clicked generic pagination button for page ${paginationInfo.nextPage}`);
              } catch (genericError) {
                console.error('Error clicking pagination button with generic selector:', genericError);
                hasMorePages = false;
              }
            }
            
            // Wait for the new page to load
            await page.waitForTimeout(5000);
          } catch (error) {
            console.error('Error clicking pagination button:', error);
            hasMorePages = false;
          }
        } else {
          console.log('No next page button found or button is disabled');
          hasMorePages = false;
        }
      } else {
        // No candidates found on this page
        console.log('No candidates found on this page');
        hasMorePages = false;
      }
      
      // Safety check - don't process more than 10 pages to prevent infinite loops
      if (currentPage > 10) {
        console.log('Reached maximum page limit (10)');
        hasMorePages = false;
      }
    }
    
    console.log(`Total candidates found: ${candidateLinks.length}`);
    
    console.log(`Final candidate list has ${candidateLinks.length} entries with ${candidateLinks.filter(c => c.url).length} profile URLs`);
    
    // Filter candidate links if a filter is provided
    let filteredLinks = candidateLinks;
    if (filter) {
      const normalizedFilter = filter.toLowerCase();
      filteredLinks = candidateLinks.filter(link => 
        link.name.toLowerCase().includes(normalizedFilter)
      );
      console.log(`Filtered to ${filteredLinks.length} candidates matching "${filter}"`);
    }
    
    // For each candidate with a profile URL, visit the page and extract detailed info
    const candidates: Partial<Candidate>[] = [];
    
    for (const { name, url } of filteredLinks) {
      let profileUrl = url;
      
      // If no URL provided or URL doesn't contain 'people', try to search for the profile
      if (!profileUrl || !profileUrl.includes('/people/')) {
        console.log(`No valid profile URL for ${name}, searching...`);
        const searchedUrl = await searchCandidateProfileUrl(name);
        if (searchedUrl) {
          profileUrl = searchedUrl;
          console.log(`Found profile URL for ${name}: ${profileUrl}`);
        }
      }
      
      if (!profileUrl) {
        // If still no URL, just add basic info
        const parsedName = parseCandidateName(name);
        candidates.push({
          name: parsedName.name,
          party: parsedName.party || '',
        });
        continue;
      }
      
      // Visit candidate profile page
      console.log(`Visiting profile for ${name}: ${profileUrl}`);
      try {
        const candidateDetail = await scrapeCandidateProfile(browser, profileUrl, name);
        candidates.push(candidateDetail);
      } catch (error) {
        console.error(`Error scraping profile for ${name}:`, error);
        // Add basic info if profile scraping fails
        const parsedName = parseCandidateName(name);
        candidates.push({
          name: parsedName.name,
          party: parsedName.party || '',
          profileUrl: profileUrl
        });
      }
      
      // Add a small delay to avoid overloading the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return candidates.filter(c => c.name && c.name.length > 0);
    
  } catch (error) {
    console.error('Error scraping Rappler data:', error);
    return [];
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

/**
 * Scrapes detailed information from a candidate's profile page
 */
export async function scrapeCandidateProfile(browser: any, url: string, candidateName: string): Promise<Partial<Candidate>> {
  const page = await browser.newPage();
  
  try {
    console.log(`Navigating to ${url}...`);
    // Increase timeout to 60 seconds and add more load options
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // Add a small wait to ensure the page has loaded
    await page.waitForTimeout(3000);
    
    console.log('Page loaded, extracting profile data...');
    
    // First check if this is a valid profile page and not a "not found" page
    const isValidProfile = await page.evaluate(() => {
      // Check for common elements that indicate a "not found" page
      const notFoundText = document.body.textContent || '';
      const hasNotFoundMessage = 
        notFoundText.includes('You may search Rappler for other stories') ||
        notFoundText.includes('Still can\'t find what you\'re looking for?') ||
        notFoundText.includes('Page not found') ||
        document.querySelector('.error-page, .not-found');
      
      // Check for elements that should exist on a valid profile page
      const hasProfileElements = 
        document.querySelector('article') || 
        document.querySelector('[class*="profile"]') ||
        document.querySelector('.peopleHeader_content__sA9bc') ||
        document.querySelector('.bio');
      
      return !hasNotFoundMessage && hasProfileElements;
    });
    
    if (!isValidProfile) {
      console.log(`Invalid profile page for ${candidateName}, skipping...`);
      return { 
        name: candidateName,
        party: parseCandidateName(candidateName).party || ''
      };
    }
    
    // Extract detailed information from the profile page
    const profileData = await page.evaluate(() => {
      const data: Record<string, string> = {};
      
      // Extract the main biography text - try multiple selector patterns
      const bioSelectors = [
        'h1 + p', 
        '.bio', 
        '[class*="bio"]',
        '.profile-description',
        '[class*="profile-description"]',
        '[class*="description"]',
        '.peopleHeader_content__sA9bc p',
        'article p',
        '.article-text p'
      ];
      
      // Try each selector until we find content
      for (const selector of bioSelectors) {
        const bioElements = document.querySelectorAll(selector);
        if (bioElements && bioElements.length > 0) {
          // Combine multiple paragraphs if found
          const bioText = Array.from(bioElements)
            .map(el => el.textContent?.trim())
            .filter(text => text && text.length > 20) // Filter out short texts
            .join('\n\n');
          
          if (bioText && bioText.length > 100) { // Make sure it's substantial bio text
            data.bio = bioText;
            break;
          }
        }
      }
      
      // If we still don't have a bio, try to get all paragraph text from the article
      if (!data.bio) {
        const articleElement = document.querySelector('article, main, .content');
        if (articleElement) {
          const paragraphs = articleElement.querySelectorAll('p');
          const bioText = Array.from(paragraphs)
            .map(el => el.textContent?.trim())
            .filter(text => text && text.length > 20)
            .join('\n\n');
          
          if (bioText && bioText.length > 100) {
            data.bio = bioText;
          }
        }
      }
      
      // Extract structured data if available
      const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
      if (structuredDataScript) {
        try {
          const structuredData = JSON.parse(structuredDataScript.textContent || '{}');
          if (structuredData.description) {
            data.structured_bio = structuredData.description;
          }
          if (structuredData.image) {
            data.structured_image = typeof structuredData.image === 'string' 
              ? structuredData.image 
              : (structuredData.image?.url || '');
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Extract data from the information table if it exists
      const tableRows = document.querySelectorAll('table tr');
      tableRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const key = cells[0].textContent?.trim().toLowerCase().replace(/\s+/g, '_') || '';
          const value = cells[1].textContent?.trim() || '';
          if (key && value) {
            data[key] = value;
          }
        }
      });
      
      // Try to extract profile image
      const imgSelectors = [
        'img[alt="candidate-icon"]',
      ];
      
      for (const selector of imgSelectors) {
        const imgElement = document.querySelector(selector);
        if (imgElement && imgElement.getAttribute('src')) {
          data.image = imgElement.getAttribute('src') || '';
          break;
        }
      }
      
      return data;
    });
    
    // Parse and structure the profile data
    const candidateDetail: CandidateDetail = {
      name: candidateName,
      party: '',
      profileUrl: url,
      // Use structured bio if available, otherwise use extracted bio
      bio: profileData.structured_bio || profileData.bio || ''
    };
    
    // Map profile data fields to our candidate structure
    if (profileData.full_name) candidateDetail.fullName = profileData.full_name;
    if (profileData.first_name) candidateDetail.firstName = profileData.first_name;
    if (profileData.middle_name) candidateDetail.middleName = profileData.middle_name;
    if (profileData.last_name) candidateDetail.lastName = profileData.last_name;
    if (profileData.suffix) candidateDetail.suffix = profileData.suffix;
    if (profileData.alias) candidateDetail.alias = profileData.alias;
    if (profileData.gender) candidateDetail.gender = profileData.gender;
    if (profileData.birthdate) candidateDetail.birthdate = profileData.birthdate;
    if (profileData.spouse) candidateDetail.spouse = profileData.spouse;
    if (profileData.profession) candidateDetail.profession = profileData.profession;
    if (profileData.education) candidateDetail.education = profileData.education;
    if (profileData.party) candidateDetail.party = profileData.party;
    if (profileData.structured_image) candidateDetail.image = profileData.structured_image;
    else if (profileData.image) candidateDetail.image = profileData.image;
    
    // Get party from name if not found in profile
    if (!candidateDetail.party) {
      const parsedName = parseCandidateName(candidateName);
      candidateDetail.party = parsedName.party || '';
      
      // Update name if needed
      if (parsedName.name && !candidateDetail.fullName) {
        candidateDetail.name = parsedName.name;
      }
    }
    
    return candidateDetail;
  } catch (error) {
    console.error(`Error scraping profile for ${candidateName}:`, error);
    return { 
      name: candidateName,
      party: parseCandidateName(candidateName).party || '',
      profileUrl: url
    };
  } finally {
    await page.close();
  }
}

/**
 * Parses candidate name from the format "NAME (PARTY)"
 */
function parseCandidateName(fullText: string): { name: string, party?: string } {
  // Try to match "NAME (PARTY)" format
  const match = fullText.match(/([^\(]+)\(([^\)]+)\)/);
  
  if (match && match.length >= 3) {
    return {
      name: match[1].trim(),
      party: match[2].trim()
    };
  }
  
  // If no match, return the text as the name
  return { name: fullText.trim() };
}

/**
 * Enhances existing candidate data with information from Rappler
 * @param existingCandidates The existing candidate data
 */
export async function enhanceCandidateData(existingCandidates: Candidate[]): Promise<Candidate[]> {
  try {
    const rapplerData = await scrapeRapplerSenatorData();
    
    if (rapplerData.length === 0) {
      console.log('No data found from Rappler, returning existing candidates');
      return existingCandidates;
    }
    
    console.log(`Enhancing ${existingCandidates.length} candidates with data from ${rapplerData.length} scraped candidates`);
    
    // Match and merge data
    const enhancedCandidates = existingCandidates.map(candidate => {
      // Find matching candidate from Rappler data
      const rapplerCandidate = rapplerData.find(rc => {
        // Normalize names for comparison
        const normalizedExistingName = normalizeNameForComparison(candidate.name);
        const normalizedRapplerName = normalizeNameForComparison(rc.name || '');
        
        return normalizedExistingName.includes(normalizedRapplerName) || 
               normalizedRapplerName.includes(normalizedExistingName);
      });
      
      if (rapplerCandidate) {
        console.log(`Found match for ${candidate.name} -> ${rapplerCandidate.name}`);
        
        // Merge data, prioritizing existing data if it exists
        return {
          ...candidate,
          bio: candidate.bio || rapplerCandidate.bio,
          platform: candidate.platform || rapplerCandidate.platform,
          achievements: candidate.achievements || rapplerCandidate.achievements,
          image: candidate.image || rapplerCandidate.image
        };
      }
      
      return candidate;
    });
    
    return enhancedCandidates;
  } catch (error) {
    console.error('Error enhancing candidate data:', error);
    return existingCandidates;
  }
}

/**
 * Normalizes a name for comparison by removing common prefixes and suffixes,
 * converting to lowercase, and removing special characters
 */
function normalizeNameForComparison(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

/**
 * Directly scrapes a specific candidate by URL
 * This can be used when we know the exact URL pattern
 * @param candidateName The name of the candidate to scrape
 * @returns The candidate data
 */
export async function scrapeSpecificCandidate(candidateName: string): Promise<Partial<Candidate> | null> {
  console.log(`Searching for profile of candidate: ${candidateName}`);
  
  // First try to search for a profile URL
  const profileUrl = await searchCandidateProfileUrl(candidateName);
  
  if (!profileUrl) {
    console.log(`No profile URL found for ${candidateName}`);
    return null;
  }
  
  console.log(`Found profile URL for ${candidateName}: ${profileUrl}`);
  
  // Now scrape the profile using the found URL
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Use the existing scrapeCandidateProfile function to extract details
    const candidateDetail = await scrapeCandidateProfile(browser, profileUrl, candidateName);
    
    // Ensure we have at least basic info
    if (!candidateDetail || !candidateDetail.name) {
      console.log(`Failed to extract profile details for ${candidateName}`);
      return {
        name: candidateName,
        party: parseCandidateName(candidateName).party || '',
        profileUrl: profileUrl
      };
    }
    
    return candidateDetail;
  } catch (error) {
    console.error(`Error scraping profile for ${candidateName}:`, error);
    return {
      name: candidateName,
      party: parseCandidateName(candidateName).party || '',
      profileUrl: profileUrl
    };
  } finally {
    await browser.close();
  }
}

/**
 * Searches for a candidate's profile URL directly on Rappler
 * @param candidateName The name of the candidate to search for
 * @returns The found profile URL or null
 */
export async function searchCandidateProfileUrl(candidateName: string): Promise<string | null> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  try {
    const page = await context.newPage();
    
    // Extract just the name part without the party
    const nameOnly = candidateName.replace(/\s*\([^)]*\)\s*$/, '').trim();
    
    // Try a direct approach first - go to people index page
    console.log(`Searching for profile of ${nameOnly}`);
    
    // First try searching directly using Rappler search
    // Format: https://www.rappler.com/search/?q=bam%20aquino
    const searchUrl = `https://www.rappler.com/search/?q=${encodeURIComponent(nameOnly)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Look for results that have the keyword "people" in the URL
    let profileUrl = await page.evaluate((name) => {
      // First look for links with '/people/' in the URL
      const searchResults = Array.from(document.querySelectorAll('a'));
      
      // Look for people links
      for (const link of searchResults) {
        const href = link.getAttribute('href');
        if (href && href.includes('/people/')) {
          // Check if the link text or surrounding text contains the name
          const linkText = link.textContent || '';
          const surroundingText = link.parentElement?.textContent || '';
          
          const nameParts = name.toLowerCase().split(' ');
          // Check if majority of name parts are in the link text or surrounding text
          const matchingParts = nameParts.filter(part => 
            linkText.toLowerCase().includes(part) || 
            surroundingText.toLowerCase().includes(part)
          );
          
          if (matchingParts.length >= Math.ceil(nameParts.length / 2)) {
            return href;
          }
        }
      }
      
      // If no good match, return the first people link found
      for (const link of searchResults) {
        const href = link.getAttribute('href');
        if (href && href.includes('/people/')) {
          return href;
        }
      }
      
      return null;
    }, nameOnly);
    
    if (profileUrl) {
      console.log(`Found profile URL for ${nameOnly}: ${profileUrl}`);
      return profileUrl;
    }
    
    // Try an alternative approach - direct URL with name format
    // Format: https://www.rappler.com/people/{last-name}-{first-name}
    const nameParts = nameOnly.split(' ');
    if (nameParts.length >= 2) {
      const firstName = nameParts[0].toLowerCase();
      const lastName = nameParts[nameParts.length - 1].toLowerCase();
      
      // Try some common URL formats
      const possibleUrls = [
        `https://www.rappler.com/people/${lastName}-${firstName}/`,
        `https://www.rappler.com/people/${lastName}/`,
        `https://www.rappler.com/people/${firstName}-${lastName}/`
      ];
      
      for (const url of possibleUrls) {
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.waitForTimeout(2000);
          
          // Check if this is a valid profile page
          const isValid = await page.evaluate(() => {
            const title = document.title;
            return !title.includes('Page not found') && 
                  !document.body.textContent?.includes('You may search Rappler');
          });
          
          if (isValid) {
            console.log(`Found valid profile URL for ${nameOnly}: ${url}`);
            return url;
          }
        } catch (error) {
          console.log(`Error checking URL ${url}: ${error}`);
          continue;
        }
      }
    }
    
    // Try one more approach - search for the name directly on Rappler's site
    try {
      // Check if there's any article that prominently features this candidate
      const articleSearchUrl = `https://www.rappler.com/search/?q=${encodeURIComponent(nameOnly + " senator")}`;
      await page.goto(articleSearchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      // Find any article that might be about this candidate
      const articleUrl = await page.evaluate((name) => {
        const articles = Array.from(document.querySelectorAll('a'));
        for (const article of articles) {
          const text = article.textContent || '';
          const href = article.getAttribute('href');
          if (!href) continue;
          
          // Look for articles that prominently mention the candidate name
          if (text.toLowerCase().includes(name.toLowerCase())) {
            return href;
          }
        }
        return null;
      }, nameOnly);
      
      if (articleUrl) {
        console.log(`Found an article about ${nameOnly}: ${articleUrl}`);
        return articleUrl;
      }
    } catch (error) {
      console.log(`Error in article search for ${nameOnly}: ${error}`);
    }
    
    console.log(`No profile URL found for ${nameOnly}`);
    return null;
  } catch (error) {
    console.error(`Error searching for profile URL for ${candidateName}:`, error);
    return null;
  } finally {
    await browser.close();
  }
} 