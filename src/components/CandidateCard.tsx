
import { cn } from '@/lib/utils';
import { Candidate } from '@/lib/positions';
import { KeyboardEvent } from 'react';
import { Info } from 'lucide-react';

// Get environment variable (default is false)
const showCandidateInfo = import.meta.env.VITE_SHOW_CANDIDATE_INFO === 'true';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (id: string) => void;
  selectionMode: 'single' | 'multiple';
  index: number;
  onViewSummary?: (candidate: Candidate) => void;
}

const CandidateCard = ({ 
  candidate, 
  isSelected, 
  onSelect,
  selectionMode,
  index,
  onViewSummary
}: CandidateCardProps) => {
  const isNationalPage = window.location.pathname === '/national';
  
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(candidate.id);
    }
  };

  const handleSummaryClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting candidate when clicking info
    if (onViewSummary) {
      onViewSummary(candidate);
    }
  };
  
  return (
    <div
      className={cn(
        "p-3 md:p-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors duration-200",
        "border border-gray-200 select-none relative",
        isSelected ? "bg-gray-100 !print:bg-gray-300" : "bg-white"
      )}
      onClick={() => onSelect(candidate.id)}
      onKeyDown={handleKeyDown}
      role={selectionMode === 'single' ? 'radio' : 'checkbox'}
      aria-checked={isSelected}
      tabIndex={0}
      aria-label={`Candidate ${candidate.name} from ${candidate.party}`}
    >
      <div className="flex items-start gap-3 touch-action-manipulation">
        <div 
          className={cn(
            "flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center",
            "print:border-2 print:border-black transition-colors duration-200",
            isSelected ? "border-primary" : "border-gray-400"
          )}
          aria-hidden="true"
        >
          {isSelected && (
            <div className="w-3 h-3 rounded-full bg-primary print:bg-black animate-scale-up"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex gap-1">
            <span className="font-medium text-gray-600">{index}.</span>
            <span className={cn(
              "font-medium uppercase truncate",
              isSelected ? "text-primary font-semibold print:font-bold" : "text-gray-800"
            )}>
              {candidate.name}
            </span>
          </div>
          <div className={cn(
            "text-xs rounded-full px-2 py-0.5 inline-block mt-1",
            "bg-gray-100 text-gray-600 font-medium"
          )}>
            {candidate.party}
          </div>
        </div>
        
        {showCandidateInfo && isNationalPage && onViewSummary && (
          <button
            className="p-1 rounded-full hover:bg-gray-200 ml-1 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={handleSummaryClick}
            aria-label={`View summary for ${candidate.name}`}
          >
            <Info size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;
