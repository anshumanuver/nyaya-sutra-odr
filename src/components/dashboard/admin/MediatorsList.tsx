
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus } from 'lucide-react';

interface MediatorsListProps {
  mediators: any[];
}

const MediatorsList = ({ mediators }: MediatorsListProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mediator Panel</h2>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Mediator
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mediators.map((mediator) => (
          <Card key={mediator.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{mediator.first_name} {mediator.last_name}</CardTitle>
                  <CardDescription>{mediator.email}</CardDescription>
                </div>
                <Badge variant="default">Available</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    View Cases
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MediatorsList;
