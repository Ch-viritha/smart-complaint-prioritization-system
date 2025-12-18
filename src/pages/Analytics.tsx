import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Complaint, ComplaintCategory, UrgencyLevel, ComplaintStatus } from '@/types/complaint';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Loader2
} from 'lucide-react';

const Analytics = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: true });

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

  // Analytics calculations
  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in_progress').length;
    const critical = complaints.filter(c => c.urgency === 'critical').length;
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0';
    
    // Average resolution time for resolved complaints
    const resolvedComplaints = complaints.filter(c => c.resolved_at);
    const avgResolutionDays = resolvedComplaints.length > 0 
      ? (resolvedComplaints.reduce((acc, c) => {
          const created = new Date(c.created_at);
          const resolved = new Date(c.resolved_at!);
          return acc + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / resolvedComplaints.length).toFixed(1)
      : 'N/A';

    return { total, resolved, pending, inProgress, critical, resolutionRate, avgResolutionDays };
  }, [complaints]);

  // Data for charts
  const categoryData = useMemo(() => {
    const categories: Record<ComplaintCategory, number> = {
      infrastructure: 0,
      public_safety: 0,
      utilities: 0,
      sanitation: 0,
      transportation: 0,
      health: 0,
      education: 0,
      other: 0
    };

    complaints.forEach(c => {
      categories[c.category]++;
    });

    return Object.entries(categories)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value
      }));
  }, [complaints]);

  const urgencyData = useMemo(() => {
    return [
      { name: 'Critical', value: complaints.filter(c => c.urgency === 'critical').length, color: 'hsl(0, 72%, 51%)' },
      { name: 'High', value: complaints.filter(c => c.urgency === 'high').length, color: 'hsl(25, 95%, 53%)' },
      { name: 'Medium', value: complaints.filter(c => c.urgency === 'medium').length, color: 'hsl(45, 93%, 47%)' },
      { name: 'Low', value: complaints.filter(c => c.urgency === 'low').length, color: 'hsl(142, 71%, 45%)' }
    ].filter(d => d.value > 0);
  }, [complaints]);

  const statusData = useMemo(() => {
    return [
      { name: 'Pending', value: stats.pending, color: 'hsl(220, 15%, 55%)' },
      { name: 'In Progress', value: stats.inProgress, color: 'hsl(200, 90%, 45%)' },
      { name: 'Resolved', value: stats.resolved, color: 'hsl(142, 71%, 45%)' }
    ].filter(d => d.value > 0);
  }, [stats]);

  // Time series data (last 7 days)
  const timeSeriesData = useMemo(() => {
    const days: Record<string, { date: string; submitted: number; resolved: number }> = {};
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[dateStr] = { date: dateStr, submitted: 0, resolved: 0 };
    }

    complaints.forEach(c => {
      const createdDate = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (days[createdDate]) {
        days[createdDate].submitted++;
      }
      if (c.resolved_at) {
        const resolvedDate = new Date(c.resolved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (days[resolvedDate]) {
          days[resolvedDate].resolved++;
        }
      }
    });

    return Object.values(days);
  }, [complaints]);

  // Resolved complaints list
  const resolvedComplaints = useMemo(() => {
    return complaints
      .filter(c => c.status === 'resolved')
      .sort((a, b) => new Date(b.resolved_at!).getTime() - new Date(a.resolved_at!).getTime())
      .slice(0, 5);
  }, [complaints]);

  const COLORS = ['hsl(220, 70%, 35%)', 'hsl(180, 50%, 40%)', 'hsl(142, 71%, 45%)', 'hsl(25, 95%, 53%)', 'hsl(0, 72%, 51%)', 'hsl(45, 93%, 47%)'];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into complaint management performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Complaints</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Resolution Rate</p>
                  <p className="text-3xl font-bold text-foreground">{stats.resolutionRate}%</p>
                </div>
                <div className="p-2 rounded-lg bg-status-resolved/10">
                  <TrendingUp className="w-5 h-5 text-status-resolved" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Resolution</p>
                  <p className="text-3xl font-bold text-foreground">{stats.avgResolutionDays}</p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
                <div className="p-2 rounded-lg bg-status-inprogress/10">
                  <Clock className="w-5 h-5 text-status-inprogress" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Critical Issues</p>
                  <p className="text-3xl font-bold text-foreground">{stats.critical}</p>
                </div>
                <div className="p-2 rounded-lg bg-urgency-critical/10">
                  <AlertTriangle className="w-5 h-5 text-urgency-critical" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Complaints by Category */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Complaints by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Urgency Distribution */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary" />
                Urgency Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {urgencyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={urgencyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {urgencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Second Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Series */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                7-Day Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="submitted" stroke="hsl(var(--primary))" strokeWidth={2} name="Submitted" />
                  <Line type="monotone" dataKey="resolved" stroke="hsl(var(--status-resolved))" strokeWidth={2} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recently Resolved */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-status-resolved" />
              Recently Resolved Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resolvedComplaints.length > 0 ? (
              <div className="space-y-4">
                {resolvedComplaints.map((complaint) => (
                  <div 
                    key={complaint.id} 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{complaint.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {complaint.tracking_id} • Resolved {new Date(complaint.resolved_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-status-resolved" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No resolved complaints yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;
