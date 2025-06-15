
import { Card, CardContent } from '@/components/ui/card';

const LoadingState = () => {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading documents...</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
