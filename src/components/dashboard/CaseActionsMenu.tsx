
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, FileText, MessageSquare, Calendar, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CaseActionsMenuProps {
  caseItem: any;
  onViewDetails: (caseItem: any) => void;
  onViewDocuments: (caseItem: any) => void;
  onAssignMediator?: (caseItem: any) => void;
  onScheduleSession?: (caseItem: any) => void;
  onSendMessage?: (caseItem: any) => void;
}

const CaseActionsMenu = ({ 
  caseItem, 
  onViewDetails, 
  onViewDocuments,
  onAssignMediator,
  onScheduleSession,
  onSendMessage
}: CaseActionsMenuProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isMediator = user?.role === 'mediator';
  const canAssignMediator = isAdmin && !caseItem.mediator_id;
  const canScheduleSession = (isAdmin || isMediator) && caseItem.mediator_id;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => { onViewDetails(caseItem); setIsOpen(false); }}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => { onViewDocuments(caseItem); setIsOpen(false); }}>
          <FileText className="h-4 w-4 mr-2" />
          Documents
        </DropdownMenuItem>

        {onSendMessage && (
          <DropdownMenuItem onClick={() => { onSendMessage(caseItem); setIsOpen(false); }}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </DropdownMenuItem>
        )}

        {canAssignMediator && onAssignMediator && (
          <DropdownMenuItem onClick={() => { onAssignMediator(caseItem); setIsOpen(false); }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Mediator
          </DropdownMenuItem>
        )}

        {canScheduleSession && onScheduleSession && (
          <DropdownMenuItem onClick={() => { onScheduleSession(caseItem); setIsOpen(false); }}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Session
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CaseActionsMenu;
