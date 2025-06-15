
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ClaimantStats from './ClaimantStats';
import CaseDetailsModal from './CaseDetailsModal';
import ClaimantDashboardHeader from './ClaimantDashboardHeader';
import CasesList from './CasesList';
import SessionsTab from './SessionsTab';
import DocumentsTab from './DocumentsTab';

interface Case {
  id: string;
  case_number: string;
  title: string;
  case_type: string;
  status: string;
  amount_in_dispute: number | null;
  currency: string | null;
  created_at: string;
  updated_at: string | null;
  dispute_mode: string;
  description: string;
  case_code: string | null;
  respondent_id: string | null;
}

const ClaimantDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCaseForDetails, setSelectedCaseForDetails] = useState<Case | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { data: cases = [], isLoading, error } = useQuery({
    queryKey: ['claimant-cases', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('claimant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cases:', error);
        throw error;
      }

      return data as Case[];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Cases",
        description: "Failed to load your cases. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Function to handle viewing case details
  const viewCaseDetails = (caseItem: Case) => {
    setSelectedCaseForDetails(caseItem);
    setIsDetailsModalOpen(true);
  };

  // Function to switch to documents tab and select case
  const viewCaseDocuments = (caseItem: Case) => {
    setSelectedCaseId(caseItem.id);
    // Switch to documents tab
    const documentsTab = document.querySelector('[value="documents"]') as HTMLElement;
    documentsTab?.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading your cases...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ClaimantDashboardHeader />

        {/* Stats Cards */}
        <div className="mb-8">
          <ClaimantStats cases={cases} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cases">My Cases</TabsTrigger>
            <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cases" className="space-y-6">
            <CasesList 
              cases={cases}
              onViewDetails={viewCaseDetails}
              onViewDocuments={viewCaseDocuments}
            />
          </TabsContent>
          
          <TabsContent value="sessions">
            <SessionsTab />
          </TabsContent>
          
          <TabsContent value="documents">
            <DocumentsTab 
              cases={cases}
              selectedCaseId={selectedCaseId}
              onSelectCase={setSelectedCaseId}
            />
          </TabsContent>
        </Tabs>

        {/* Case Details Modal */}
        <CaseDetailsModal
          case_item={selectedCaseForDetails}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedCaseForDetails(null);
          }}
        />
      </div>
    </div>
  );
};

export default ClaimantDashboard;
