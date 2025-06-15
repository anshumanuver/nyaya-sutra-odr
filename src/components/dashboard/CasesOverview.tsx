
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import EnhancedCaseCard from './EnhancedCaseCard';
import CaseDetailsView from './CaseDetailsView';
import CaseDetailsModal from './CaseDetailsModal';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface CasesOverviewProps {
  userRole: 'claimant' | 'respondent' | 'mediator' | 'admin';
  onAssignMediator?: (caseItem: any) => void;
}

const CasesOverview = ({ userRole, onAssignMediator }: CasesOverviewProps) => {
  const { user } = useAuth();
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isDetailsViewOpen, setIsDetailsViewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['user-cases', userRole, user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('cases')
        .select(`
          *,
          claimant:claimant_id (id, first_name, last_name, email),
          respondent:respondent_id (id, first_name, last_name, email),
          mediator:mediator_id (id, first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      // Filter based on user role
      switch (userRole) {
        case 'claimant':
          query = query.eq('claimant_id', user.id);
          break;
        case 'respondent':
          query = query.eq('respondent_id', user.id);
          break;
        case 'mediator':
          query = query.eq('mediator_id', user.id);
          break;
        case 'admin':
          // Admin sees all cases
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cases:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const filteredCases = cases.filter(case_item => {
    const matchesSearch = case_item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_item.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || case_item.status === statusFilter;
    const matchesType = typeFilter === 'all' || case_item.case_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDetails = (caseItem: any) => {
    setSelectedCase(caseItem);
    setIsDetailsViewOpen(true);
  };

  const handleViewDocuments = (caseItem: any) => {
    console.log('View documents for case:', caseItem.id);
    // TODO: Implement document view
  };

  const handleScheduleSession = (caseItem: any) => {
    console.log('Schedule session for case:', caseItem.id);
    // TODO: Implement session scheduling
  };

  const handleSendMessage = (caseItem: any) => {
    console.log('Send message for case:', caseItem.id);
    // TODO: Implement messaging
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="filed">Filed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="consumer">Consumer</SelectItem>
                <SelectItem value="employment">Employment</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'No matches found' : 'No cases found'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Try adjusting your search criteria'
                : userRole === 'claimant' 
                  ? 'Start by filing your first case'
                  : 'No cases available at the moment'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredCases.map((case_item) => (
            <EnhancedCaseCard
              key={case_item.id}
              case_item={case_item}
              onViewDetails={handleViewDetails}
              onViewDocuments={handleViewDocuments}
              onAssignMediator={onAssignMediator}
              onScheduleSession={handleScheduleSession}
              onSendMessage={handleSendMessage}
              showParticipants={userRole === 'admin' || userRole === 'mediator'}
            />
          ))}
        </div>
      )}

      {/* Case Details View */}
      {isDetailsViewOpen && selectedCase && (
        <CaseDetailsView
          caseId={selectedCase.id}
          onClose={() => {
            setIsDetailsViewOpen(false);
            setSelectedCase(null);
          }}
        />
      )}
    </div>
  );
};

export default CasesOverview;
