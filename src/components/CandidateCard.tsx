
import { cn } from '@/lib/utils';
import { Candidate } from '@/lib/positions';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (id: string) => void;
  selectionMode: 'single' | 'multiple';
  index: number;
}

const CandidateCard = ({ 
  candidate, 
  isSelected, 
  onSelect,
  selectionMode,
  index
}: CandidateCardProps) => {
  return (
    <div
      className={cn(
        "p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200",
        "border border-gray-200 select-none",
        isSelected ? "bg-gray-100 !print:bg-gray-300" : "bg-white"
      )}
      onClick={() => onSelect(candidate.id)}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center",
          "print:border-2 print:border-black transition-colors duration-200",
          isSelected ? "border-primary" : "border-gray-400"
        )}>
          {isSelected && (
            <div className="w-3 h-3 rounded-full bg-primary print:bg-black animate-scale-up"></div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex gap-1">
            <span className="font-medium text-gray-600">{index}.</span>
            <span className={cn(
              "font-medium uppercase",
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
      </div>
    </div>
  );
};

export default CandidateCard;
