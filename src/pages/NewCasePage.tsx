
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, FileText, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const caseFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  case_type: z.enum(['civil', 'consumer', 'property', 'commercial', 'family', 'employment']),
  dispute_mode: z.enum(['mediation', 'arbitration']),
  amount_in_dispute: z.string().optional().refine(
    (val) => !val || !isNaN(Number(val.replace(/[^\d.]/g, ''))),
    'Amount must be a valid number'
  ),
  currency: z.string().default('INR'),
  respondent_email: z.string().email('Please enter a valid email address'),
  respondent_name: z.string().min(2, 'Respondent name is required'),
});

type CaseFormValues = z.infer<typeof caseFormSchema>;

// Function to generate a unique case code
const generateCaseCode = () => {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CASE${year}${randomPart}`;
};

const NewCasePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      currency: 'INR',
      dispute_mode: 'mediation',
      title: '',
      description: '',
      amount_in_dispute: '',
      respondent_email: '',
      respondent_name: '',
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
      // Convert amount to number if provided
      const amountInDispute = values.amount_in_dispute ? 
        parseFloat(values.amount_in_dispute.replace(/[^\d.]/g, '')) : null;

      // Generate a unique case code
      let caseCode = generateCaseCode();
      let isUnique = false;
      let attempts = 0;
      
      // Ensure the case code is unique
      while (!isUnique && attempts < 10) {
        const { data: existingCase } = await supabase
          .from('cases')
          .select('id')
          .eq('case_code', caseCode)
          .maybeSingle();
        
        if (!existingCase) {
          isUnique = true;
        } else {
          caseCode = generateCaseCode();
          attempts++;
        }
      }

      if (!isUnique) {
        throw new Error('Unable to generate unique case code. Please try again.');
      }

      const caseData = {
        title: values.title,
        description: values.description,
        case_type: values.case_type,
        dispute_mode: values.dispute_mode,
        amount_in_dispute: amountInDispute,
        currency: values.currency,
        claimant_id: user.id,
        status: 'filed',
        case_code: caseCode,
      };

      console.log('Creating case with data:', caseData);

      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert([caseData])
        .select()
        .single();

      if (caseError) {
        console.error('Error creating case:', caseError);
        throw caseError;
      }

      console.log('Case created successfully:', newCase);

      toast({
        title: "Case Filed Successfully!",
        description: `Your case ${newCase.case_number} has been filed with code ${caseCode}. Share this code with the respondent to join.`,
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
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Scale className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">File New Case</h1>
              <p className="text-gray-600 mt-1">Submit your dispute for online resolution</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Details
            </CardTitle>
            <CardDescription>
              Please provide comprehensive details about your dispute. A unique case code will be generated for the respondent to join.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Case Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Contract Dispute with ABC Company" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="case_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select case type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="civil">Civil</SelectItem>
                            <SelectItem value="consumer">Consumer</SelectItem>
                            <SelectItem value="property">Property</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="employment">Employment</SelectItem>
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select resolution method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mediation">Mediation</SelectItem>
                            <SelectItem value="arbitration">Arbitration</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount_in_dispute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount in Dispute</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 50000" 
                            type="text"
                            {...field} 
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a detailed description of your dispute, including relevant facts, timeline, and what resolution you're seeking..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Respondent Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="respondent_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Respondent Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Full name or company name" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="respondent_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Respondent Email *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="respondent@example.com" 
                              type="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/claimant')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? 'Filing Case...' : 'File Case'}
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
