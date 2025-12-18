import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import {
  Shield,
  Brain,
  Clock,
  BarChart3,
  MapPin,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
  TrendingUp
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Classification',
      description: 'Automatically detect urgency and categorize complaints using advanced NLP and machine learning.'
    },
    {
      icon: TrendingUp,
      title: 'Smart Prioritization',
      description: 'Dynamic priority queue ensures critical issues get attention first based on impact analysis.'
    },
    {
      icon: Clock,
      title: 'Resolution Time Prediction',
      description: 'ML models predict estimated resolution time based on historical data and complexity.'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Dashboards',
      description: 'Live analytics for government officials to monitor performance and bottlenecks.'
    },
    {
      icon: MapPin,
      title: 'Location Intelligence',
      description: 'Geographic analysis to identify problem hotspots and allocate resources efficiently.'
    },
    {
      icon: MessageSquare,
      title: 'Sentiment Analysis',
      description: 'Understand citizen emotions to prioritize distressed cases and improve responses.'
    }
  ];

  const stats = [
    { value: '95%', label: 'Accuracy in Classification' },
    { value: '60%', label: 'Faster Resolution' },
    { value: '10K+', label: 'Complaints Processed' },
    { value: '4.8/5', label: 'Citizen Satisfaction' }
  ];

  const steps = [
    {
      icon: MessageSquare,
      title: 'Submit Your Complaint',
      description: 'Fill in the details of your concern with optional attachments and location.'
    },
    {
      icon: Brain,
      title: 'AI Analyzes & Prioritizes',
      description: 'Our AI classifies urgency, predicts resolution time, and routes to the right department.'
    },
    {
      icon: Users,
      title: 'Government Takes Action',
      description: 'Officials receive prioritized tasks with all relevant information for quick resolution.'
    },
    {
      icon: CheckCircle,
      title: 'Track & Get Updates',
      description: 'Monitor progress in real-time and receive notifications at each step.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Governance</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
              Transform Government
              <span className="gradient-hero bg-clip-text text-transparent"> Complaint Resolution</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-powered complaint management system that classifies urgency, predicts resolution time, 
              and ensures transparent, accountable governance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/submit">
                <Button size="lg" className="gap-2 gradient-hero shadow-elegant hover:shadow-glow transition-all">
                  Submit Complaint
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/track">
                <Button variant="outline" size="lg" className="gap-2">
                  Track Status
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Intelligent Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leveraging cutting-edge AI to revolutionize how governments handle citizen complaints
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300 border-border/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A streamlined process designed for efficiency and transparency
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4 shadow-elegant">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="gradient-hero rounded-2xl p-8 md:p-12 text-center shadow-elegant">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-4">
              Ready to Submit Your Complaint?
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
              Our AI-powered system ensures your voice is heard and your concerns are addressed quickly.
            </p>
            <Link to="/submit">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Landing;
