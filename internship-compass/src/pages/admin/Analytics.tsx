// src/pages/admin/Analytics.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

type TimeRange = '7d' | '30d' | '90d' | 'all';

// Professional color palette (inspired by Ghana/tech branding feel)
const COLORS = {
  primary: '#006D77',     // deep teal/blue-green
  primaryLight: '#83C5BE',
  accent: '#F4A261',      // warm gold/orange
  accentDark: '#E07A5F',
  neutral: '#EDF6F9',
  text: '#272640',
  gray: '#8A8CA2',
};

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
}

const StatCard = ({ title, value, description }: StatCardProps) => (
  <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalMentors: 0,
    totalPaidBookings: 0,
    totalRevenueGHS: 0,
  });

  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [activityOverTime, setActivityOverTime] = useState<any[]>([]);
  const [revenueOverTime, setRevenueOverTime] = useState<any[]>([]);
  const [topUniversities, setTopUniversities] = useState<any[]>([]);
  const [topIndustries, setTopIndustries] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/admin/analytics', {
          params: { range: timeRange },
        });

        const data = res.data;

        setStats({
          totalStudents: data.total_students || 0,
          totalCompanies: data.total_companies || 0,
          totalMentors: data.total_mentors || 0,
          totalPaidBookings: data.paid_bookings_count || 0,
          totalRevenueGHS: data.total_revenue_ghs || 0,
        });

        setUserGrowth(data.user_growth || []);
        setActivityOverTime(data.activity_over_time || []);
        setRevenueOverTime(data.revenue_over_time || []);
        setTopUniversities(data.top_universities || []);
        setTopIndustries(data.top_industries || []);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const handleExport = () => {
    toast.info("Export report feature coming soon...");
    // Future: CSV / PDF generation
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 space-y-10">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-5 w-80 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl shadow animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-white rounded-xl shadow animate-pulse" />
          <div className="h-96 bg-white rounded-xl shadow animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Platform Analytics
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Overview of users, activity, and revenue performance
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="w-auto">
            <TabsList className="bg-white border shadow-sm">
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            className="border-gray-300 hover:bg-gray-100"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          description="Registered student accounts"
        />
        <StatCard
          title="Partner Companies"
          value={stats.totalCompanies.toLocaleString()}
          description="Active host organizations"
        />
        <StatCard
          title="Active Mentors"
          value={stats.totalMentors.toLocaleString()}
          description="Career guidance professionals"
        />
        <StatCard
          title="Paid Placements"
          value={stats.totalPaidBookings.toLocaleString()}
          description="Completed paid bookings"
        />
        <StatCard
          title="Total Revenue"
          value={`GHS ${stats.totalRevenueGHS.toLocaleString()}`}
          description="All-time platform earnings"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth – Stacked Area */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-gray-900">
              User Growth
            </CardTitle>
            <CardDescription className="text-gray-600">
              New registrations over time (Students + Companies + Mentors)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke={COLORS.gray} />
                <YAxis stroke={COLORS.gray} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="students"
                  stackId="1"
                  stroke={COLORS.primary}
                  fill={COLORS.primaryLight}
                  name="Students"
                />
                <Area
                  type="monotone"
                  dataKey="companies"
                  stackId="1"
                  stroke={COLORS.accentDark}
                  fill={COLORS.accent}
                  name="Companies"
                />
                <Area
                  type="monotone"
                  dataKey="mentors"
                  stackId="1"
                  stroke="#4B5EAA"
                  fill="#A3BFFA"
                  name="Mentors"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Trend – Line */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Platform Activity
            </CardTitle>
            <CardDescription className="text-gray-600">
              Applications submitted vs Sessions booked
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke={COLORS.gray} />
                <YAxis stroke={COLORS.gray} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke={COLORS.primary}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2 }}
                  name="Applications"
                />
                <Line
                  type="monotone"
                  dataKey="booked_sessions"
                  stroke={COLORS.accentDark}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2 }}
                  name="Booked Sessions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend – Bar */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Revenue Trend (GHS)
            </CardTitle>
            <CardDescription className="text-gray-600">
              Income from mentorship & internship placements
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke={COLORS.gray} />
                <YAxis stroke={COLORS.gray} />
                <Tooltip
                  formatter={(value) => `GHS ${Number(value).toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill={COLORS.primary}
                  radius={[8, 8, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Universities – Pie */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Top Source Universities
            </CardTitle>
            <CardDescription className="text-gray-600">
              Distribution of registered students
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-96 flex items-center justify-center">
            {topUniversities.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topUniversities}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="university"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {topUniversities.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.primaryLight} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} students`, name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-12">
                No university data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Industries – Horizontal Bar */}
        <Card className="border-none shadow-lg lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Most In-Demand Industries
            </CardTitle>
            <CardDescription className="text-gray-600">
              Internship & mentorship interest by sector
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topIndustries} layout="vertical" margin={{ left: 150 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke={COLORS.gray} />
                <YAxis type="category" dataKey="industry" stroke={COLORS.gray} width={140} />
                <Tooltip
                  formatter={(value) => [`${value} requests`, 'Count']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill={COLORS.accent}
                  radius={[0, 8, 8, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-gray-500 pt-12 pb-8">
        Data last updated • {new Date().toLocaleDateString('en-GH', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
};

export default AnalyticsPage;