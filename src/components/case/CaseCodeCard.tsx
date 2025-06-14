
import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface CaseCodeCardProps {
  caseCode: string;
  caseNumber: string;
}

const CaseCodeCard = ({ caseCode, caseNumber }: CaseCodeCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(caseCode);
      setCopied(true);
      toast({
        title: "Case Code Copied!",
        description: "The case code has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy the case code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareCase = async () => {
    const shareText = `Join my dispute resolution case using this code: ${caseCode}\n\nCase: ${caseNumber}\nVisit: ${window.location.origin}/join-case`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join My Case',
          text: shareText,
        });
      } catch (error) {
        // User cancelled share or error occurred
        copyToClipboard();
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Share Text Copied!",
          description: "The case sharing message has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Failed to copy share text. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Share2 className="h-5 w-5" />
          Case Code for Respondent
        </CardTitle>
        <CardDescription className="text-blue-700">
          Share this code with the respondent so they can join your case
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input 
            value={caseCode}
            readOnly
            className="font-mono text-lg font-bold text-center bg-white border-blue-300"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            className="border-blue-300 hover:bg-blue-100"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={copyToClipboard}
            className="flex-1 border-blue-300 hover:bg-blue-100"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </Button>
          <Button
            onClick={shareCase}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Case
          </Button>
        </div>
        
        <div className="text-xs text-blue-600 bg-blue-100 p-3 rounded">
          <strong>Instructions for respondent:</strong><br />
          1. Visit {window.location.origin}/join-case<br />
          2. Enter the case code: <span className="font-mono font-bold">{caseCode}</span><br />
          3. Review case details and join as respondent
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseCodeCard;
