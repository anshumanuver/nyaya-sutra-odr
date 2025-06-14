
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

const newCaseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title is too long'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  case_type: z.enum(['civil', 'consumer', 'property', 'commercial', 'family', 'employment']),
  dispute_mode: z.enum(['mediation', 'arbitration']),
  amount_in_dispute: z.string().optional(),
  currency: z.enum(['INR', 'USD', 'EUR']).default('INR'),
});

type NewCaseValues = z.infer<typeof newCaseSchema>;

const NewCasePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewCaseValues>({
    resolver: zodResolver(newCaseSchema),
    defaultValues: {
      currency: 'INR',
    },
  });

  const onSubmit = async (values: NewCaseValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a case.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const caseCode = generateCaseCode();
      const amount = values.amount_in_dispute ? parseFloat(values.amount_in_dispute) : null;

      const { data, error } = await supabase
        .from('cases')
        .insert([
          {
            title: values.title,
            description: values.description,
            case_type: values.case_type,
            dispute_mode: values.dispute_mode,
            amount_in_dispute: amount,
            currency: values.currency,
            claimant_id: user.id,
            status: 'filed',
            case_code: caseCode,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating case:', error);
        throw error;
      }

      toast({
        title: "Case Created Successfully!",
        description: `Your case has been filed with case number: ${data.case_number}`,
      });

      navigate('/dashboard/claimant');
    } catch (error: any) {
      console.error('Error creating case:', error);
      toast({
        title: "Error Creating Case",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard/claimant')} className="mb-4">
            ← Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">File a New Case</h1>
            <p className="text-gray-600">Start your dispute resolution process</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
            <CardDescription>
              Provide details about your dispute to initiate the resolution process
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
                      <FormLabel>Case Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of your dispute" {...field} />
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
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed explanation of the dispute, including relevant facts and timeline"
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
                        <FormLabel>Case Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <FormLabel>Preferred Resolution Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select resolution mode" />
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="amount_in_dispute"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount in Dispute (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <div className="pt-6 border-t">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Creating Case...' : 'File Case'}
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
