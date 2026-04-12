import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Shield, 
  Users, 
  BarChart3, 
  TrendingUp,
  FileText,
  Lock,
  User,
  Activity,
  Database,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const DashboardLandingPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If user is authenticated, redirect to actual dashboard
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vendorsoluce-green"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }


  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Real-time Risk Monitoring',
      description: 'Track vendor risk scores and get instant alerts on critical changes'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'NIST 800-161 Compliance',
      description: 'Built-in compliance framework aligned with federal cybersecurity standards'
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'SBOM Analysis',
      description: 'Analyze software bill of materials for vulnerabilities and dependencies'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Vendor Management',
      description: 'Centralized platform to manage all your vendor relationships and assessments'
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Automated Reports',
      description: 'Generate compliance reports and risk assessments automatically'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Actionable Insights',
      description: 'Get recommendations to improve your supply chain security posture'
    }
  ];

  const benefits = [
    'No credit card required',
    '14-day free trial',
    'Cancel anytime',
    'Full access to all features',
    'Priority support included',
    'Setup in minutes'
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-vendorsoluce-green/10 rounded-full mb-6">
            <BarChart3 className="h-8 w-8 text-vendorsoluce-green" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Supply Chain Risk Management Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Get complete visibility into your supply chain security. Monitor vendors, assess risks, 
            and ensure compliance with powerful analytics and automated insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signin?redirect=/dashboard">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <User className="h-5 w-5 mr-2" />
                Sign In to Dashboard
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Pricing
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Everything you need to manage supply chain risk
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-vendorsoluce-green/10 rounded-lg flex items-center justify-center text-vendorsoluce-green mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Start your free trial today
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-vendorsoluce-green mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/signin?redirect=/dashboard">
                <Button variant="primary" size="lg">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Preview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-vendorsoluce-green" />
              Dashboard Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sign in to access your personalized dashboard with real-time metrics, 
                vendor risk scores, and actionable insights.
              </p>
              <Link to="/signin?redirect=/dashboard">
                <Button variant="primary">
                  <User className="h-4 w-4 mr-2" />
                  Sign In to View Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-vendorsoluce-navy to-vendorsoluce-teal text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to secure your supply chain?</h2>
          <p className="text-xl text-gray-100 mb-6 max-w-2xl mx-auto">
            Join organizations using VendorSoluce to manage supply chain risks and ensure compliance
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signin?redirect=/dashboard">
              <Button variant="secondary" size="lg" className="bg-white text-vendorsoluce-navy hover:bg-gray-100">
                <User className="h-5 w-5 mr-2" />
                Sign In Now
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
                View Plans
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLandingPage;

