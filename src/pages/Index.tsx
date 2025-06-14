
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Users, MessageSquare, FileText, Clock, Award, Shield, CheckCircle } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

const Index = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: Scale,
      title: "Digital Mediation",
      description: "Structured mediation process with certified mediators"
    },
    {
      icon: Award,
      title: "Online Arbitration", 
      description: "Legally binding arbitration proceedings"
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Secure document upload and e-signature capabilities"
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Real-time messaging and video conferencing"
    },
    {
      icon: Shield,
      title: "Legal Compliance",
      description: "Adheres to Indian Arbitration and Conciliation Act"
    },
    {
      icon: Clock,
      title: "Faster Resolution",
      description: "Resolve disputes 70% faster than traditional methods"
    }
  ];

  const stats = [
    { label: "Cases Resolved", value: "2,500+" },
    { label: "Success Rate", value: "89%" },
    { label: "Avg. Resolution Time", value: "45 days" },
    { label: "Satisfied Users", value: "4.8/5" }
  ];

  if (showLogin) {
    return <LoginForm onBack={() => setShowLogin(false)} />;
  }

  if (showRegister) {
    return <RegisterForm onBack={() => setShowRegister(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">LexODR</span>
              <Badge variant="secondary" className="ml-2">MVP</Badge>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setShowLogin(true)}>
                Login
              </Button>
              <Button onClick={() => setShowRegister(true)} className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Resolve Disputes
            <span className="text-blue-600 block">Digitally & Efficiently</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            India's premier Online Dispute Resolution platform for mediation and arbitration. 
            Streamline your legal processes with certified neutrals and secure digital workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowRegister(true)}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              Start Your Case
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/demo')}
              className="text-lg px-8 py-3"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete ODR Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From case filing to resolution, we provide end-to-end digital dispute resolution services
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple 4-step process to resolve your disputes online
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">File Case</h3>
              <p className="text-gray-600">Submit your dispute details and supporting documents</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Assign Neutral</h3>
              <p className="text-gray-600">Get matched with certified mediator or arbitrator</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Digital Session</h3>
              <p className="text-gray-600">Participate in online mediation or arbitration</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-xl font-semibold mb-2">Resolution</h3>
              <p className="text-gray-600">Receive legally binding settlement or award</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Resolve Your Dispute?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied users who have resolved their disputes efficiently through our platform
          </p>
          <Button 
            size="lg" 
            onClick={() => setShowRegister(true)}
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Start Your Case Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="h-6 w-6" />
                <span className="text-xl font-bold">LexODR</span>
              </div>
              <p className="text-gray-400">
                India's trusted online dispute resolution platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mediation</li>
                <li>Arbitration</li>
                <li>Case Management</li>
                <li>Document Vault</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Compliance</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>System Status</li>
                <li>Community</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LexODR. All rights reserved. Compliant with Indian Arbitration and Conciliation Act.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
