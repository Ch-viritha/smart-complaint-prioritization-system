import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UrgencyBadge, StatusBadge, CategoryBadge } from '@/components/badges/StatusBadges';
import { supabase } from '@/integrations/supabase/client';
import { Complaint, UrgencyLevel, ComplaintStatus, ComplaintCategory } from '@/types/complaint';
import {
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  BarChart3,
  TrendingUp,
  Users,
  Brain,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'urgency' | 'date' | 'predicted'>('urgency');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedComplaints: Complaint[] = (data || []).map(item => ({
        id: item.id,
        tracking_id: item.tracking_id,
        title: item.title,
        description: item.description,
        category: item.category as ComplaintCategory,
        urgency: item.urgency as UrgencyLevel,
        status: item.status as ComplaintStatus,
        location: item.location || undefined,
        citizen_name: item.citizen_name,
        citizen_email: item.citizen_email,
        citizen_phone: item.citizen_phone || undefined,
        predicted_resolution_days: item.predicted_resolution_days || 7,
        sentiment_score: item.sentiment_score ? Number(item.sentiment_score) : undefined,
        ai_urgency_reason: item.ai_urgency_reason || undefined,
        ai_suggested_department: item.ai_suggested_department || undefined,
        ai_keywords: item.ai_keywords || undefined,
        created_at: item.created_at,
        updated_at: item.updated_at,
        resolved_at: item.resolved_at || undefined
      }));

      setComplaints(mappedComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const urgencyOrder: Record<UrgencyLevel, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3
  };

  const filteredComplaints = useMemo(() => {
    let result = [...complaints];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tracking_id.toLowerCase().includes(query)
      );
    }

    // Urgency filter
    if (filterUrgency !== 'all') {
      result = result.filter(c => c.urgency === filterUrgency);
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(c => c.status === filterStatus);
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(c => c.category === filterCategory);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'predicted':
          return a.predicted_resolution_days - b.predicted_resolution_days;
        default:
          return 0;
      }
    });

    return result;
  }, [complaints, searchQuery, filterUrgency, filterStatus, filterCategory, sortBy]);

  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      inProgress: complaints.filter(c => c.status === 'in_progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      critical: complaints.filter(c => c.urgency === 'critical').length
    };
  }, [complaints]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Complaint Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage all citizen complaints in real-time
            </p>
          </div>
          <Button onClick={fetchComplaints} variant="outline" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-status-pending/10">
                  <Clock className="w-5 h-5 text-status-pending" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-status-inprogress/10">
                  <Loader2 className="w-5 h-5 text-status-inprogress" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-status-resolved/10">
                  <CheckCircle className="w-5 h-5 text-status-resolved" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.resolved}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-urgency-critical/10">
                  <AlertTriangle className="w-5 h-5 text-urgency-critical" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.critical}</p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-elegant">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={filterUrgency} onValueChange={(v) => setFilterUrgency(v as UrgencyLevel | 'all')}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ComplaintStatus | 'all')}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'urgency' | 'date' | 'predicted')}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgency">By Urgency</SelectItem>
                  <SelectItem value="date">By Date</SelectItem>
                  <SelectItem value="predicted">By Resolution</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredComplaints.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="py-12 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Complaints Found</h3>
              <p className="text-muted-foreground">
                {complaints.length === 0 
                  ? "No complaints have been submitted yet."
                  : "No complaints match your current filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {complaint.tracking_id}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(complaint.created_at)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {complaint.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {complaint.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <UrgencyBadge urgency={complaint.urgency} />
                        <StatusBadge status={complaint.status} />
                        <CategoryBadge category={complaint.category} />
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{complaint.predicted_resolution_days} days est.</span>
                      </div>
                      <Link to={`/track?id=${complaint.tracking_id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
