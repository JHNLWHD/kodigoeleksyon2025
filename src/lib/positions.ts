import { senatorCandidates } from './candidateData/senators';
import { partyListCandidates } from './candidateData/partyList';
import { 
  zamboangaHouseRepFirstCandidates,
  zamboangaHouseRepSecondCandidates,
  zamboangaMayorCandidates,
  zamboangaViceMayorCandidates,
  zamboangaCouncilorFirstCandidates,
  zamboangaCouncilorSecondCandidates
} from './candidateData/zamboangaCandidates';

export interface Candidate {
  id: string;
  name: string;
  party: string;
  image?: string; // Path to candidate image
  bio?: string; // Candidate biography/background
  platform?: string; // Candidate platform/advocacies
  achievements?: string; // Candidate achievements
  profileUrl?: string; // URL to candidate's profile page
}

export interface Position {
  id: string;
  title: string;
  description: string;
  maxSelections: number;
  candidates: Candidate[];
}

// Mock data for election positions and candidates
// In a real application, this would come from an API
export const positions: Position[] = [
  {
    id: "house-rep-zamboanga-first",
    title: "Member, House of Representatives - Zamboanga Del Sur (First District)",
    description: "Representatives of Zamboanga Del Sur's First Legislative District in the House of Representatives.",
    maxSelections: 1,
    candidates: zamboangaHouseRepFirstCandidates
  },
  {
    id: "house-rep-zamboanga-second",
    title: "Member, House of Representatives - Zamboanga Del Sur (Second District)",
    description: "Representatives of Zamboanga Del Sur's Second Legislative District in the House of Representatives.",
    maxSelections: 1,
    candidates: zamboangaHouseRepSecondCandidates
  },
  {
    id: "mayor-zamboanga",
    title: "Mayor - City of Zamboanga",
    description: "The chief executive of the City of Zamboanga.",
    maxSelections: 1,
    candidates: zamboangaMayorCandidates
  },
  {
    id: "vice-mayor-zamboanga",
    title: "Vice-Mayor - City of Zamboanga",
    description: "The second-highest executive official in the City of Zamboanga.",
    maxSelections: 1,
    candidates: zamboangaViceMayorCandidates
  },
  {
    id: "councilor-zamboanga-first",
    title: "Councilor - City of Zamboanga (First District)",
    description: "Members of the city council for Zamboanga City's First District.",
    maxSelections: 8,
    candidates: zamboangaCouncilorFirstCandidates
  },
  {
    id: "councilor-zamboanga-second",
    title: "Councilor - City of Zamboanga (Second District)",
    description: "Members of the city council for Zamboanga City's Second District.",
    maxSelections: 8,
    candidates: zamboangaCouncilorSecondCandidates
  },
  {
    id: "senators",
    title: "Senator",
    description: "Members of the Senate, the upper chamber of Congress.",
    maxSelections: 12,
    candidates: senatorCandidates
  },
  {
    id: "party-list",
    title: "Party List",
    description: "Representatives of marginalized and underrepresented sectors.",
    maxSelections: 1,
    candidates: partyListCandidates
  }
];
