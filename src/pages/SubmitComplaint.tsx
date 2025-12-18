import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ComplaintCategory, UrgencyLevel } from '@/types/complaint';
import {
  FileText,
  MapPin,
  User,
  Mail,
  Phone,
  Brain,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as ComplaintCategory,
    location: '',
    citizen_name: '',
    citizen_email: '',
    citizen_phone: ''
  });

  const categories: { value: ComplaintCategory; label: string }[] = [
    { value: 'infrastructure', label: 'Infrastructure (Roads, Buildings, etc.)' },
    { value: 'public_safety', label: 'Public Safety & Security' },
    { value: 'utilities', label: 'Utilities (Water, Electricity, Gas)' },
    { value: 'sanitation', label: 'Sanitation & Waste Management' },
    { value: 'transportation', label: 'Transportation & Traffic' },
    { value: 'health', label: 'Health Services' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' }
  ];

  // Simple AI analysis simulation
  const analyzeComplaint = (description: string): { urgency: UrgencyLevel; reason: string; department: string; keywords: string[] } => {
    const lowerDesc = description.toLowerCase();
    
    // Critical keywords
    if (lowerDesc.includes('emergency') || lowerDesc.includes('dangerous') || lowerDesc.includes('life-threatening') || lowerDesc.includes('flood') || lowerDesc.includes('fire')) {
      return {
        urgency: 'critical',
        reason: 'Contains emergency or life-threatening keywords requiring immediate attention',
        department: 'Emergency Response',
        keywords: ['emergency', 'urgent', 'critical']
      };
    }
    
    // High priority keywords
    if (lowerDesc.includes('safety') || lowerDesc.includes('broken') || lowerDesc.includes('hazard') || lowerDesc.includes('leak')) {
      return {
        urgency: 'high',
        reason: 'Safety concern or infrastructure damage requiring prompt attention',
        department: 'Public Works',
        keywords: ['safety', 'hazard', 'damage']
      };
    }
    
    // Medium priority
    if (lowerDesc.includes('maintenance') || lowerDesc.includes('repair') || lowerDesc.includes('issue')) {
      return {
        urgency: 'medium',
        reason: 'Standard maintenance or repair request',
        department: 'Maintenance',
        keywords: ['maintenance', 'repair', 'service']
      };
    }
    
    // Low priority default
    return {
      urgency: 'low',
      reason: 'General inquiry or non-urgent request',
      department: 'General Services',
      keywords: ['general', 'inquiry']
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.citizen_name || !formData.citizen_email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    const analysis = analyzeComplaint(formData.description);
    
    setIsAnalyzing(false);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location || null,
          citizen_name: formData.citizen_name,
          citizen_email: formData.citizen_email,
          citizen_phone: formData.citizen_phone || null,
          urgency: analysis.urgency,
          ai_urgency_reason: analysis.reason,
          ai_suggested_department: analysis.department,
          ai_keywords: analysis.keywords,
          predicted_resolution_days: analysis.urgency === 'critical' ? 1 : analysis.urgency === 'high' ? 3 : analysis.urgency === 'medium' ? 7 : 14
        })
        .select('tracking_id')
        .single();

      if (error) throw error;

      setGeneratedId(data.tracking_id);
      setShowSuccess(true);
      
      toast({
        title: "Complaint Submitted Successfully!",
        description: `Your tracking ID is ${data.tracking_id}`,
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <Card className="max-w-md w-full shadow-elegant">
            <CardContent className="pt-8 text-center">
              <div className="w-20 h-20 rounded-full bg-status-resolved flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Complaint Submitted!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your complaint has been successfully registered and is being processed.
              </p>
              
              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Your Tracking ID</p>
                <p className="text-2xl font-display font-bold text-primary">{generatedId}</p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full gap-2" 
                  onClick={() => navigate(`/track?id=${generatedId}`)}
                >
                  Track Your Complaint
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowSuccess(false);
                    setFormData({
                      title: '',
                      description: '',
                      category: 'other',
                      location: '',
                      citizen_name: '',
                      citizen_email: '',
                      citizen_phone: ''
                    });
                  }}
                >
                  Submit Another Complaint
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Submit a Complaint
            </h1>
            <p className="text-muted-foreground">
              Fill out the form below and our AI will analyze and prioritize your complaint for faster resolution.
            </p>
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Complaint Details
              </CardTitle>
              <CardDescription>
                Provide as much detail as possible to help us address your concern effectively.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Complaint Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief summary of your complaint"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your complaint..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: ComplaintCategory) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="Address or landmark where the issue is located"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                {/* Citizen Info */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Your Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={formData.citizen_name}
                        onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.citizen_email}
                        onChange={(e) => setFormData({ ...formData, citizen_email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Your contact number (optional)"
                        value={formData.citizen_phone}
                        onChange={(e) => setFormData({ ...formData, citizen_phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* AI Analysis Notice */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground mb-1">AI-Powered Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        Upon submission, our AI will analyze your complaint to determine urgency level, 
                        predict resolution time, and route it to the appropriate department.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full gap-2 gradient-hero shadow-elegant"
                  disabled={isSubmitting || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Brain className="w-4 h-4 animate-pulse" />
                      AI Analyzing...
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Complaint
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SubmitComplaint;
