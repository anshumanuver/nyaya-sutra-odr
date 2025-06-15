
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClaimantDashboardHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Claimant Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your dispute resolution cases</p>
      </div>
      <Button onClick={() => navigate('/case/new')} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" />
        File New Case
      </Button>
    </div>
  );
};

export default ClaimantDashboardHeader;
