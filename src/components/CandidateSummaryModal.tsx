
import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Candidate } from '@/lib/positions';

interface CandidateSummaryModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
}

const CandidateSummaryModal: React.FC<CandidateSummaryModalProps> = ({
  candidate,
  isOpen,
  onClose
}) => {
  if (!isOpen || !candidate) return null;

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // Close on escape key
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in print:hidden">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-summary-title"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 
            id="candidate-summary-title" 
            className="text-lg font-semibold text-gray-900"
          >
            Candidate Information
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <span className="font-medium text-primary text-xl">
                {candidate.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
              <p className="text-sm text-gray-600">{candidate.party}</p>
            </div>
          </div>
          
          {/* Candidate Bio */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-1">Background</h4>
            <p className="text-sm text-gray-600">
              {candidate.bio || "No detailed information available for this candidate."}
            </p>
          </div>
          
          {/* Platform/Advocacies */}
          {candidate.platform && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-1">Platform & Advocacies</h4>
              <p className="text-sm text-gray-600">{candidate.platform}</p>
            </div>
          )}
          
          {/* Achievements */}
          {candidate.achievements && (
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Achievements</h4>
              <p className="text-sm text-gray-600">{candidate.achievements}</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            This information is provided for educational purposes only. 
            For official candidate information, please refer to COMELEC resources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateSummaryModal;
