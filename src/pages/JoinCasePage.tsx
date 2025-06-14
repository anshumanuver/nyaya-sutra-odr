import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const joinCaseSchema = z.object({
  case_code: z.string().min(8, 'Please enter a valid case code').max(12, 'Case code is too long'),
});

type JoinCaseValues = z.infer<typeof joinCaseSchema>;

interface CaseDetails {
  id: string;
  case_number: string;
  title: string;
  case_type: string;
  amount_in_dispute: number | null;
  currency: string | null;
  created_at: string;
  claimant_id: string;
}

const JoinCasePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const form = useForm<JoinCaseValues>({
    resolver: zodResolver(joinCaseSchema),
  });

  const searchCase = async (values: JoinCaseValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to join a case.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setCaseDetails(null);

    try {
      const { data: caseData, error } = await supabase
        .from('cases')
        .select('id, case_number, title, case_type, amount_in_dispute, currency, created_at, claimant_id')
        .eq('case_code', values.case_code.toUpperCase())
        .eq('status', 'filed')
        .is('respondent_id', null)
        .single();

      if (error || !caseData) {
        setSearchError('Case not found or already has a respondent assigned.');
        return;
      }

      if (caseData.claimant_id === user.id) {
        setSearchError('You cannot join a case that you filed.');
        return;
      }

      setCaseDetails(caseData);
    } catch (error: any) {
      console.error('Error searching for case:', error);
      setSearchError('An error occurred while searching for the case.');
    } finally {
      setIsSearching(false);
    }
  };

  const joinCase = async () => {
    if (!user || !caseDetails) return;

    setIsJoining(true);

    try {
      const { error } = await supabase
        .from('cases')
        .update({ respondent_id: user.id, status: 'pending' })
        .eq('id', caseDetails.id)
        .is('respondent_id', null);

      if (error) {
        console.error('Error joining case:', error);
        throw error;
      }

      toast({
        title: "Successfully Joined Case!",
        description: `You are now the respondent for case ${caseDetails.case_number}.`,
      });

      navigate('/dashboard/respondent');
    } catch (error: any) {
      console.error('Error joining case:', error);
      toast({
        title: "Error Joining Case",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return 'Not specified';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join a Case</h1>
            <p className="text-gray-600">Enter the case code provided by the claimant to join the dispute resolution process</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Case
            </CardTitle>
            <CardDescription>
              Enter the 8-12 character case code you received from the claimant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(searchCase)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="case_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., CASE2025A1B2" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isSearching}
                  className="w-full"
                >
                  {isSearching ? 'Searching...' : 'Search Case'}
                </Button>
              </form>
            </Form>

            {searchError && (
              <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}

            {caseDetails && (
              <div className="mt-6 p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Case Found!</h3>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Case Number:</span>
                    <span className="ml-2">{caseDetails.case_number}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Title:</span>
                    <span className="ml-2">{caseDetails.title}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 capitalize">{caseDetails.case_type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Amount in Dispute:</span>
                    <span className="ml-2">{formatCurrency(caseDetails.amount_in_dispute, caseDetails.currency)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Filed Date:</span>
                    <span className="ml-2">{formatDate(caseDetails.created_at)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-800 mb-3">
                    By joining this case, you agree to participate in the dispute resolution process as the respondent.
                  </p>
                  <Button 
                    onClick={joinCase}
                    disabled={isJoining}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isJoining ? 'Joining Case...' : 'Join This Case'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Don't have a case code? Contact the person who filed the dispute to get the case code.</p>
        </div>
      </div>
    </div>
  );
};

export default JoinCasePage;
