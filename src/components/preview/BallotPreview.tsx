
import { useRef, useState } from 'react';
import { Download, Printer, Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Position, Candidate } from '@/lib/positions';
import html2canvas from 'html2canvas';
import useAnalytics from '@/hooks/useAnalytics';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon
} from 'react-share';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

type BallotCandidate = {
  position: Position;
  candidate: Candidate;
};

interface BallotPreviewProps {
  selectedCandidatesList: BallotCandidate[];
  selectedPositions: string[];
  positions: Position[];
  cityName?: string;
  shareLink?: string;
}

const BallotPreview = ({ 
  selectedCandidatesList, 
  selectedPositions,
  positions,
  cityName = "Zamboanga City",
  shareLink
}: BallotPreviewProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const ballotRef = useRef<HTMLDivElement>(null);
  const { trackEvent } = useAnalytics();
  const isMobile = useIsMobile();
  
  const getCandidatesForPosition = (positionId: string) => {
    return selectedCandidatesList
      .filter(item => item.position.id === positionId)
      .map(item => item.candidate);
  };
  
  const handlePrint = () => {
    trackEvent('preview', 'print_ballot', 'Print ballot');
    window.print();
  };
  
  const handleDownload = async () => {
    if (!ballotRef.current) return;
    
    setIsPrinting(true);
    
    try {
      const canvas = await html2canvas(ballotRef.current, {
        scale: isMobile ? 1 : 2,
        useCORS: true,
        logging: false,
        backgroundColor: 'white',
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `kodigo-eleksyon-${cityName.toLowerCase().replace(/\s+/g, '-')}-ballot.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      trackEvent('preview', 'download_ballot', 'Download ballot image');
    } catch (error) {
      console.error('Error generating ballot image:', error);
    } finally {
      setIsPrinting(false);
    }
  };
  
  const handleCopyLink = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Link copied to clipboard!');
      trackEvent('preview', 'copy_share_link', 'Copied share link to clipboard');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link');
    }
  };
  
  const shareTitle = `My Kodigo Eleksyon 2025 ${cityName} Ballot`;
  const shareDescription = `Check out my personalized ${cityName} ballot for the 2025 Philippine elections!`;
  
  return (
    <div className="bg-white rounded-lg border overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="border-b p-3 sm:p-4 bg-gradient-to-r from-background to-muted/30">
        <h2 className="text-lg sm:text-xl font-bold text-center mb-3">Your Kodigo Ballot</h2>
        
        <div className="flex justify-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="text-xs flex items-center gap-1 h-9 px-3 sm:px-4 bg-white hover:bg-muted/20 touch-manipulation"
            onClick={handlePrint}
            disabled={isPrinting}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </Button>
          
          <Button
            variant="default"
            size={isMobile ? "sm" : "default"}
            className="text-xs flex items-center gap-1 h-9 px-3 sm:px-4 touch-manipulation"
            onClick={handleDownload}
            disabled={isPrinting}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </Button>
          
          {shareLink && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size={isMobile ? "sm" : "default"}
                  className="text-xs flex items-center gap-1 h-9 px-3 sm:px-4 touch-manipulation"
                  disabled={isPrinting}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="center">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-center mb-2">Share via</h4>
                  <div className="flex gap-3 justify-center">
                    <FacebookShareButton url={shareLink} title={shareTitle}>
                      <FacebookIcon size={36} round className="touch-manipulation" />
                    </FacebookShareButton>
                    <TwitterShareButton url={shareLink} title={shareTitle}>
                      <TwitterIcon size={36} round className="touch-manipulation" />
                    </TwitterShareButton>
                    <WhatsappShareButton url={shareLink} title={shareTitle}>
                      <WhatsappIcon size={36} round className="touch-manipulation" />
                    </WhatsappShareButton>
                    <TelegramShareButton url={shareLink} title={shareTitle}>
                      <TelegramIcon size={36} round className="touch-manipulation" />
                    </TelegramShareButton>
                  </div>
                  <div className="mt-3 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs py-5 touch-manipulation"
                      onClick={handleCopyLink}
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      
      <div 
        ref={ballotRef}
        className={cn(
          "p-4 sm:p-6 pt-6 sm:pt-8 print:p-0 bg-white transition-opacity relative",
          isPrinting ? "opacity-70" : "opacity-100"
        )}
      >
        <div className="text-center mb-6 sm:mb-8 print:mb-4 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-ph-blue via-ph-yellow to-ph-red rounded-full print:hidden"></div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-primary print:text-black">
            KODIGO ELEKSYON 2025
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground print:text-gray-700 mt-1">
            Your personalized ballot guide for {cityName}
          </p>
          <div className="border-b-2 border-dashed border-gray-300 my-3 sm:my-4 print:border-gray-400"></div>
        </div>
        
        <div className="space-y-4 sm:space-y-6 print:space-y-2">
          {selectedPositions.length > 0 ? (
            positions
              .filter(position => selectedPositions.includes(position.id))
              .map(position => {
                const candidatesForPosition = getCandidatesForPosition(position.id);
                
                return (
                  <div key={position.id} className="print:page-break-inside-avoid group">
                    <div className="bg-muted/60 print:bg-gray-200 px-3 sm:px-4 py-2 rounded-md print:rounded-none">
                      <h3 className="font-medium text-gray-800 print:text-black text-sm sm:text-base">
                        {position.title}
                      </h3>
                    </div>
                    
                    <div className="mt-2 sm:mt-3 ml-2 sm:ml-3 space-y-1.5 sm:space-y-2 print:mt-1">
                      {candidatesForPosition.map(candidate => (
                        <div key={candidate.id} className="flex items-center gap-2 p-1.5 rounded-md group-hover:bg-muted/30 transition-colors duration-150">
                          <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-primary print:bg-black flex-shrink-0"></div>
                          <span className="font-medium text-sm sm:text-base">{candidate.name}</span>
                          <span className="text-xs sm:text-sm text-muted-foreground print:text-gray-600 max-w-[180px] overflow-hidden text-ellipsis">
                            ({candidate.party})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="py-12 sm:py-16 text-center text-muted-foreground">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted mb-3">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
              <p className="text-sm">No candidates selected. Go back to make your selections.</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 sm:mt-8 print:mt-6 text-center text-xs text-muted-foreground">
          <div className="border-t-2 border-dashed border-gray-300 mb-3 sm:mb-4 print:border-gray-400"></div>
          <p className="print:text-gray-700 text-[10px] sm:text-xs">
            Generated at kodigoeleksyon2025.netlify.app • Election day: May 12, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default BallotPreview;
