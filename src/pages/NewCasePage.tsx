
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { generateCaseCode } from '@/utils/caseUtils';

const caseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title is too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description is too long'),
  case_type: z.string().min(1, 'Please select a case type'),
  dispute_mode: z.string().min(1, 'Please select a dispute resolution mode'),
  amount_in_dispute: z.number().min(0, 'Amount cannot be negative').optional(),
  currency: z.string().optional(),
});

type CaseFormValues = z.infer<typeof caseSchema>;

const NewCasePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      currency: 'INR',
    },
  });

  const onSubmit = async (values: CaseFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to file a case.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a unique case code
      let caseCode = generateCaseCode();
      let attempts = 0;
      const maxAttempts = 5;

      // Ensure case code is unique
      while (attempts < maxAttempts) {
        const { data: existingCase } = await supabase
          .from('cases')
          .select('id')
          .eq('case_code', caseCode)
          .single();

        if (!existingCase) {
          break; // Code is unique
        }

        caseCode = generateCaseCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique case code. Please try again.');
      }

      const caseData = {
        title: values.title.trim(),
        description: values.description.trim(),
        case_type: values.case_type,
        dispute_mode: values.dispute_mode,
        amount_in_dispute: values.amount_in_dispute || null,
        currency: values.currency || 'INR',
        claimant_id: user.id,
        case_code: caseCode,
        status: 'filed'
      };

      console.log('Submitting case data:', caseData);

      const { data, error } = await supabase
        .from('cases')
        .insert(caseData)
        .select()
        .single();

      if (error) {
        console.error('Error creating case:', error);
        throw new Error(error.message || 'Failed to create case');
      }

      console.log('Case created successfully:', data);

      toast({
        title: "Case Filed Successfully!",
        description: `Your case has been filed with case number ${data.case_number}. Share case code "${caseCode}" with the respondent.`,
        duration: 8000,
      });

      navigate('/dashboard/claimant');
    } catch (error: any) {
      console.error('Error filing case:', error);
      toast({
        title: "Error Filing Case",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard/claimant')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">File a New Case</h1>
            <p className="text-gray-600">Submit your dispute for online resolution</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Information
            </CardTitle>
            <CardDescription>
              Provide detailed information about your dispute to begin the resolution process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Title *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Brief description of your dispute" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain your dispute in detail, including relevant facts and circumstances"
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="case_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select case type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="commercial">Commercial Dispute</SelectItem>
                            <SelectItem value="consumer">Consumer Complaint</SelectItem>
                            <SelectItem value="employment">Employment Dispute</SelectItem>
                            <SelectItem value="property">Property Dispute</SelectItem>
                            <SelectItem value="family">Family Dispute</SelectItem>
                            <SelectItem value="contract">Contract Dispute</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dispute_mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Resolution Method *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select resolution method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mediation">Mediation</SelectItem>
                            <SelectItem value="arbitration">Arbitration</SelectItem>
                            <SelectItem value="conciliation">Conciliation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="amount_in_dispute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount in Dispute (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter amount"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Filing Case...' : 'File Case'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/dashboard/claimant')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewCasePage;
