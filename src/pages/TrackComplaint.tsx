import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UrgencyBadge, StatusBadge, CategoryBadge } from '@/components/badges/StatusBadges';
import { supabase } from '@/integrations/supabase/client';
import { Complaint, ComplaintStatus, ComplaintCategory, UrgencyLevel } from '@/types/complaint';
import {
  Search,
  Clock,
  Calendar,
  MapPin,
  Brain,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const TrackComplaint = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [searchId, setSearchId] = useState(initialId);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
    setInitialLoad(false);
  }, []);

  const handleSearch = async (id?: string) => {
    const searchValue = id || searchId;
    if (!searchValue.trim()) return;

    setIsSearching(true);
    setNotFound(false);

    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .or(`tracking_id.ilike.%${searchValue}%,id.eq.${searchValue.length === 36 ? searchValue : '00000000-0000-0000-0000-000000000000'}`)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setComplaint({
          id: data.id,
          tracking_id: data.tracking_id,
          title: data.title,
          description: data.description,
          category: data.category as ComplaintCategory,
          urgency: data.urgency as UrgencyLevel,
          status: data.status as ComplaintStatus,
          location: data.location || undefined,
          citizen_name: data.citizen_name,
          citizen_email: data.citizen_email,
          citizen_phone: data.citizen_phone || undefined,
          predicted_resolution_days: data.predicted_resolution_days || 7,
          sentiment_score: data.sentiment_score ? Number(data.sentiment_score) : undefined,
          ai_urgency_reason: data.ai_urgency_reason || undefined,
          ai_suggested_department: data.ai_suggested_department || undefined,
          ai_keywords: data.ai_keywords || undefined,
          created_at: data.created_at,
          updated_at: data.updated_at,
          resolved_at: data.resolved_at || undefined
        });
        setNotFound(false);
      } else {
        setNotFound(true);
        setComplaint(null);
      }
    } catch (error) {
      console.error('Error searching complaint:', error);
      setNotFound(true);
      setComplaint(null);
    } finally {
      setIsSearching(false);
    }
  };

  const getTimelineSteps = (status: ComplaintStatus) => {
    const steps = [
      { 
        label: 'Submitted', 
        status: 'completed' as const, 
        description: 'Complaint received and logged' 
      },
      { 
        label: 'AI Analysis', 
        status: status === 'pending' ? 'current' : 'completed' as const,
        description: 'Priority and category determined' 
      },
      { 
        label: 'In Progress', 
        status: status === 'pending' ? 'upcoming' : status === 'in_progress' ? 'current' : 'completed' as const,
        description: 'Being addressed by officials' 
      },
      { 
        label: 'Resolved', 
        status: status === 'resolved' ? 'completed' : 'upcoming' as const,
        description: 'Issue has been resolved' 
      }
    ];
    return steps;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Track Your Complaint
            </h1>
            <p className="text-muted-foreground">
              Enter your tracking ID to check the status of your complaint
            </p>
          </div>

          {/* Search Box */}
          <Card className="mb-8 shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter Tracking ID (e.g., GOV-A1B2C3D4)"
                    className="pl-10"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={() => handleSearch()} 
                  disabled={isSearching}
                  className="gap-2 gradient-hero"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Track
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Not Found */}
          {notFound && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Complaint Not Found</h3>
                    <p className="text-sm text-muted-foreground">
                      No complaint found with ID "{searchId}". Please check the ID and try again.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complaint Details */}
          {complaint && (
            <div className="space-y-6">
              {/* Main Info Card */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tracking ID</p>
                      <CardTitle className="text-2xl font-display">{complaint.tracking_id}</CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <UrgencyBadge urgency={complaint.urgency} />
                      <StatusBadge status={complaint.status} />
                      <CategoryBadge category={complaint.category} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{complaint.title}</h3>
                    <p className="text-muted-foreground">{complaint.description}</p>
                  </div>

                  {/* Meta Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Submitted:</span>
                      <span className="text-foreground">{formatDate(complaint.created_at)}</span>
                    </div>
                    {complaint.location && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Location:</span>
                        <span className="text-foreground">{complaint.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Est. Resolution:</span>
                      <span className="text-foreground">{complaint.predicted_resolution_days} days</span>
                    </div>
                    {complaint.resolved_at && (
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-status-resolved" />
                        <span className="text-muted-foreground">Resolved:</span>
                        <span className="text-foreground">{formatDate(complaint.resolved_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* AI Analysis */}
                  {complaint.ai_urgency_reason && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium text-foreground mb-1">AI Analysis</h4>
                          <p className="text-sm text-muted-foreground mb-2">{complaint.ai_urgency_reason}</p>
                          {complaint.ai_suggested_department && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Assigned to:</span>{' '}
                              <span className="font-medium text-foreground">{complaint.ai_suggested_department}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-lg">Progress Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {getTimelineSteps(complaint.status).map((step, index) => (
                      <div key={index} className="flex gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center
                            ${step.status === 'completed' ? 'bg-status-resolved text-primary-foreground' : 
                              step.status === 'current' ? 'bg-status-inprogress text-primary-foreground' : 
                              'bg-muted text-muted-foreground'}
                          `}>
                            {step.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : step.status === 'current' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                          {index < 3 && (
                            <div className={`
                              w-0.5 h-full mt-2
                              ${step.status === 'completed' ? 'bg-status-resolved' : 'bg-muted'}
                            `} />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            step.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                          }`}>
                            {step.label}
                          </h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!complaint && !notFound && !initialLoad && (
            <Card className="bg-muted/30">
              <CardContent className="py-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Search for Your Complaint</h3>
                <p className="text-muted-foreground">
                  Enter your tracking ID above to view the status and details of your complaint.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrackComplaint;
