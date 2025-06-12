// Fixed Admin Dashboard Component with Proper TypeScript Types
// src/components/admin/BikeEnquiryDashboard.tsx

import React, { useState, useEffect, JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bike,
  User,
  DollarSign,
  Calendar,
  TrendingUp,
  Eye,
  MessageSquare,
  Filter,
  Download,
  Search,
} from "lucide-react";

// Type definitions
interface BikeEnquiry {
  bikeId?: string;
  bikeModel?: string;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  preferredFeatures?: string[];
  intendedUse?: string;
  previousBikeExperience?: string;
  urgency?: string;
  additionalRequirements?: string;
  tradeInBike?: {
    hasTradeIn: boolean;
    currentBikeModel?: string;
    currentBikeYear?: number;
    estimatedValue?: number;
    condition?: string;
  };
}

interface EnquiryApplication {
  _id: string;
  applicationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employmentType: string;
  monthlyIncome: number;
  creditScoreRange: string;
  status: string;
  enquiryType: string;
  bikeEnquiry?: BikeEnquiry;
  branch?: {
    _id: string;
    name: string;
    address: string;
  };
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  preApprovalAmount?: number;
  preApprovalValidUntil?: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EnquiryFilters {
  status: string;
  enquiryType: string;
  category: string;
  urgency: string;
  search: string;
  page: number;
  limit: number;
}

interface EnquiryStats {
  enquiryTypeBreakdown: {
    [key: string]: number;
  };
  categoryInterest: {
    [key: string]: number;
  };
  urgencyBreakdown: {
    [key: string]: number;
  };
  tradeInStats: {
    _id: string;
    count: number;
    avgEstimatedValue: number;
  }[];
}

interface UseEnquiryApplicationsReturn {
  applications: EnquiryApplication[];
  total: number;
  loading: boolean;
  error?: string;
}

interface UseEnquiryStatsReturn {
  loading: boolean;
  data: EnquiryStats | null;
  error?: string;
}

// Mock API hooks with proper typing
const useEnquiryApplications = (
  filters: EnquiryFilters
): UseEnquiryApplicationsReturn => {
  const [data, setData] = useState<UseEnquiryApplicationsReturn>({
    applications: [],
    total: 0,
    loading: true,
  });

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const mockApplications: EnquiryApplication[] = [
        {
          _id: "1",
          applicationId: "GAB-123456",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "+91 9876543210",
          employmentType: "salaried",
          monthlyIncome: 50000,
          creditScoreRange: "good",
          status: "pending",
          enquiryType: "specific-bike",
          bikeEnquiry: {
            bikeModel: "Honda CB350RS",
            category: "sport",
            intendedUse: "daily-commute",
            urgency: "within-month",
            tradeInBike: {
              hasTradeIn: true,
              currentBikeModel: "Honda Shine",
              currentBikeYear: 2020,
              estimatedValue: 45000,
              condition: "good",
            },
          },
          termsAccepted: true,
          privacyPolicyAccepted: true,
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
        },
        {
          _id: "2",
          applicationId: "GA-789012",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com",
          phone: "+91 9876543211",
          employmentType: "self-employed",
          monthlyIncome: 75000,
          creditScoreRange: "excellent",
          status: "pre-approved",
          enquiryType: "trade-in",
          bikeEnquiry: {
            category: "adventure",
            intendedUse: "long-touring",
            urgency: "immediate",
            tradeInBike: {
              hasTradeIn: true,
              currentBikeModel: "Royal Enfield Classic",
              currentBikeYear: 2019,
              estimatedValue: 80000,
              condition: "excellent",
            },
          },
          termsAccepted: true,
          privacyPolicyAccepted: true,
          createdAt: "2024-01-14T15:45:00Z",
          updatedAt: "2024-01-14T15:45:00Z",
        },
      ];

      setData({
        applications: mockApplications,
        total: mockApplications.length,
        loading: false,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [filters]);

  return data;
};

const useEnquiryStats = (): UseEnquiryStatsReturn => {
  const [stats, setStats] = useState<UseEnquiryStatsReturn>({
    loading: true,
    data: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockStats: EnquiryStats = {
        enquiryTypeBreakdown: {
          "specific-bike": 45,
          "general-financing": 30,
          "trade-in": 20,
          upgrade: 5,
        },
        categoryInterest: {
          sport: 25,
          adventure: 20,
          cruiser: 15,
          naked: 15,
          electric: 10,
          touring: 15,
        },
        urgencyBreakdown: {
          immediate: 15,
          "within-month": 35,
          "within-3months": 30,
          exploring: 20,
        },
        tradeInStats: [
          { _id: "excellent", count: 5, avgEstimatedValue: 45000 },
          { _id: "good", count: 12, avgEstimatedValue: 35000 },
          { _id: "fair", count: 8, avgEstimatedValue: 25000 },
          { _id: "poor", count: 3, avgEstimatedValue: 15000 },
        ],
      };

      setStats({
        loading: false,
        data: mockStats,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return stats;
};

export const BikeEnquiryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [filters, setFilters] = useState<EnquiryFilters>({
    status: "all",
    enquiryType: "all",
    category: "all",
    urgency: "all",
    search: "",
    page: 1,
    limit: 10,
  });

  const { applications, total, loading } = useEnquiryApplications(filters);
  const { data: stats } = useEnquiryStats();

  const updateFilter = (key: keyof EnquiryFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pre-approved":
        return "bg-blue-100 text-blue-800";
      case "under-review":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEnquiryTypeIcon = (type: string): JSX.Element => {
    switch (type) {
      case "specific-bike":
        return <Bike className='h-4 w-4' />;
      case "trade-in":
        return <DollarSign className='h-4 w-4' />;
      default:
        return <User className='h-4 w-4' />;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatEnquiryType = (type: string): string => {
    return type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatUrgency = (urgency: string): string => {
    return urgency.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Remove unused variable warning

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Bike Financing Enquiries</h1>
          <p className='text-gray-600'>
            Manage financing applications with bike preferences
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button variant='outline' size='sm'>
            <Filter className='h-4 w-4 mr-2' />
            Advanced Filters
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='applications'>Applications</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='recommendations'>Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          {/* Key Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>Total Enquiries</p>
                    <p className='text-2xl font-bold'>{total}</p>
                  </div>
                  <User className='h-8 w-8 text-blue-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>Bike-Specific</p>
                    <p className='text-2xl font-bold'>
                      {stats?.enquiryTypeBreakdown["specific-bike"] || 0}
                    </p>
                  </div>
                  <Bike className='h-8 w-8 text-green-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>Trade-ins</p>
                    <p className='text-2xl font-bold'>
                      {stats?.enquiryTypeBreakdown["trade-in"] || 0}
                    </p>
                  </div>
                  <DollarSign className='h-8 w-8 text-orange-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>Urgent Requests</p>
                    <p className='text-2xl font-bold'>
                      {stats?.urgencyBreakdown?.immediate || 0}
                    </p>
                  </div>
                  <Calendar className='h-8 w-8 text-red-600' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {loading ? (
                  <div className='text-center py-4'>Loading...</div>
                ) : (
                  applications.slice(0, 5).map((app) => (
                    <div
                      key={app._id}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-2'>
                          {getEnquiryTypeIcon(app.enquiryType)}
                          <div>
                            <h3 className='font-medium'>
                              {app.firstName} {app.lastName}
                            </h3>
                            <p className='text-sm text-gray-600'>{app.email}</p>
                          </div>
                        </div>

                        {app.bikeEnquiry?.bikeModel && (
                          <Badge variant='outline'>
                            {app.bikeEnquiry.bikeModel}
                          </Badge>
                        )}

                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>

                      <div className='text-right'>
                        <p className='text-sm font-medium'>
                          {formatCurrency(app.monthlyIncome)}/mo
                        </p>
                        <p className='text-sm text-gray-600'>
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Popular Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {stats &&
                    Object.entries(stats.categoryInterest).map(
                      ([category, count]) => (
                        <div
                          key={category}
                          className='flex justify-between items-center'
                        >
                          <span className='capitalize'>{category}</span>
                          <div className='flex items-center space-x-2'>
                            <div className='w-24 bg-gray-200 rounded-full h-2'>
                              <div
                                className='bg-blue-600 h-2 rounded-full'
                                style={{ width: `${(count / 25) * 100}%` }}
                              />
                            </div>
                            <span className='text-sm font-medium'>{count}</span>
                          </div>
                        </div>
                      )
                    )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Purchase Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {stats &&
                    Object.entries(stats.urgencyBreakdown).map(
                      ([urgency, count]) => (
                        <div
                          key={urgency}
                          className='flex justify-between items-center'
                        >
                          <span className='capitalize'>
                            {formatUrgency(urgency)}
                          </span>
                          <div className='flex items-center space-x-2'>
                            <div className='w-24 bg-gray-200 rounded-full h-2'>
                              <div
                                className='bg-green-600 h-2 rounded-full'
                                style={{ width: `${(count / 35) * 100}%` }}
                              />
                            </div>
                            <span className='text-sm font-medium'>{count}</span>
                          </div>
                        </div>
                      )
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value='applications' className='space-y-6'>
          {/* Filters */}
          <Card>
            <CardContent className='p-4'>
              <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
                <div className='relative'>
                  <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search applications...'
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    className='pl-9'
                  />
                </div>

                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Statuses</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='under-review'>Under Review</SelectItem>
                    <SelectItem value='pre-approved'>Pre-approved</SelectItem>
                    <SelectItem value='approved'>Approved</SelectItem>
                    <SelectItem value='rejected'>Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.enquiryType}
                  onValueChange={(value) => updateFilter("enquiryType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Enquiry Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='specific-bike'>Specific Bike</SelectItem>
                    <SelectItem value='general-financing'>
                      General Financing
                    </SelectItem>
                    <SelectItem value='trade-in'>Trade-in</SelectItem>
                    <SelectItem value='upgrade'>Upgrade</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.category}
                  onValueChange={(value) => updateFilter("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Categories</SelectItem>
                    <SelectItem value='sport'>Sport</SelectItem>
                    <SelectItem value='adventure'>Adventure</SelectItem>
                    <SelectItem value='cruiser'>Cruiser</SelectItem>
                    <SelectItem value='naked'>Naked</SelectItem>
                    <SelectItem value='electric'>Electric</SelectItem>
                    <SelectItem value='touring'>Touring</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.urgency}
                  onValueChange={(value) => updateFilter("urgency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Urgency' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Urgency</SelectItem>
                    <SelectItem value='immediate'>Immediate</SelectItem>
                    <SelectItem value='within-month'>Within Month</SelectItem>
                    <SelectItem value='within-3months'>
                      Within 3 Months
                    </SelectItem>
                    <SelectItem value='exploring'>Exploring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {loading ? (
                  <div className='text-center py-8'>
                    Loading applications...
                  </div>
                ) : (
                  applications.map((app) => (
                    <div
                      key={app._id}
                      className='border rounded-lg p-4 hover:bg-gray-50'
                    >
                      <div className='flex justify-between items-start'>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-3 mb-2'>
                            {getEnquiryTypeIcon(app.enquiryType)}
                            <h3 className='font-semibold'>
                              {app.firstName} {app.lastName}
                            </h3>
                            <Badge className={getStatusColor(app.status)}>
                              {app.status}
                            </Badge>
                            <Badge variant='outline'>
                              {formatEnquiryType(app.enquiryType)}
                            </Badge>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
                            <div>
                              <p className='text-gray-600'>Contact</p>
                              <p>{app.email}</p>
                              <p>{app.phone}</p>
                            </div>

                            <div>
                              <p className='text-gray-600'>Income</p>
                              <p className='font-medium'>
                                {formatCurrency(app.monthlyIncome)}/mo
                              </p>
                            </div>

                            {app.bikeEnquiry && (
                              <div>
                                <p className='text-gray-600'>Bike Interest</p>
                                {app.bikeEnquiry.bikeModel && (
                                  <p className='font-medium'>
                                    {app.bikeEnquiry.bikeModel}
                                  </p>
                                )}
                                {app.bikeEnquiry.category && (
                                  <p className='capitalize'>
                                    {app.bikeEnquiry.category}
                                  </p>
                                )}
                                {app.bikeEnquiry.urgency && (
                                  <p className='capitalize'>
                                    {formatUrgency(app.bikeEnquiry.urgency)}
                                  </p>
                                )}
                              </div>
                            )}

                            {app.bikeEnquiry?.tradeInBike?.hasTradeIn && (
                              <div>
                                <p className='text-gray-600'>Trade-in</p>
                                <p className='font-medium'>
                                  {app.bikeEnquiry.tradeInBike.currentBikeModel}
                                </p>
                                <p className='text-green-600'>Has trade-in</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className='flex flex-col space-y-2'>
                          <Button size='sm' variant='outline'>
                            <Eye className='h-4 w-4 mr-2' />
                            View Details
                          </Button>
                          <Button size='sm' variant='outline'>
                            <MessageSquare className='h-4 w-4 mr-2' />
                            Recommendations
                          </Button>
                          <p className='text-xs text-gray-500 text-right'>
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value='analytics' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Enquiry Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {stats &&
                    Object.entries(stats.enquiryTypeBreakdown).map(
                      ([type, count]) => (
                        <div
                          key={type}
                          className='flex justify-between items-center'
                        >
                          <div className='flex items-center space-x-2'>
                            {getEnquiryTypeIcon(type)}
                            <span className='capitalize'>
                              {formatEnquiryType(type)}
                            </span>
                          </div>
                          <div className='flex items-center space-x-3'>
                            <div className='w-32 bg-gray-200 rounded-full h-3'>
                              <div
                                className='bg-blue-600 h-3 rounded-full'
                                style={{ width: `${(count / 45) * 100}%` }}
                              />
                            </div>
                            <span className='font-medium w-8'>{count}</span>
                          </div>
                        </div>
                      )
                    )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trade-in Value Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {stats?.tradeInStats.map((stat) => (
                    <div
                      key={stat._id}
                      className='flex justify-between items-center'
                    >
                      <span className='capitalize'>{stat._id} condition</span>
                      <div className='text-right'>
                        <p className='font-medium'>
                          {formatCurrency(stat.avgEstimatedValue)}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {stat.count} bikes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Interest Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                {stats &&
                  Object.entries(stats.categoryInterest).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className='text-center p-4 border rounded-lg'
                      >
                        <Bike className='h-8 w-8 mx-auto mb-2 text-gray-600' />
                        <h3 className='font-medium capitalize'>{category}</h3>
                        <p className='text-2xl font-bold text-blue-600'>
                          {count}
                        </p>
                        <p className='text-sm text-gray-600'>enquiries</p>
                      </div>
                    )
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value='recommendations' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Bike Recommendations Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-gray-500'>
                <TrendingUp className='h-12 w-12 mx-auto mb-4' />
                <h3 className='text-lg font-medium mb-2'>
                  AI-Powered Recommendations
                </h3>
                <p>
                  This feature will analyze customer preferences and suggest the
                  best bikes
                </p>
                <p>based on their profile, budget, and intended use.</p>
                <Button className='mt-4'>Coming Soon</Button>
              </div>
            </CardContent>
          </Card>

          {/* Sample Recommendations */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Top Recommended Bikes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {[
                    {
                      model: "Honda CB350RS",
                      matches: 12,
                      category: "sport",
                      avgIncome: 45000,
                    },
                    {
                      model: "Royal Enfield Himalayan",
                      matches: 8,
                      category: "adventure",
                      avgIncome: 55000,
                    },
                    {
                      model: "TVS Apache RTR 160",
                      matches: 6,
                      category: "sport",
                      avgIncome: 35000,
                    },
                  ].map((bike, index) => (
                    <div
                      key={index}
                      className='flex justify-between items-center p-3 border rounded'
                    >
                      <div>
                        <h4 className='font-medium'>{bike.model}</h4>
                        <p className='text-sm text-gray-600 capitalize'>
                          {bike.category}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium'>{bike.matches} matches</p>
                        <p className='text-sm text-gray-600'>
                          {formatCurrency(bike.avgIncome)} avg income
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendation Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='p-4 bg-blue-50 rounded-lg'>
                    <h4 className='font-medium text-blue-900'>
                      High Demand Categories
                    </h4>
                    <p className='text-sm text-blue-800'>
                      Sport and Adventure bikes are most requested
                    </p>
                  </div>
                  <div className='p-4 bg-green-50 rounded-lg'>
                    <p className='text-sm text-green-800'>
                      ₹40,000-60,000 monthly income range shows highest
                      conversion
                    </p>
                  </div>
                  <div className='p-4 bg-orange-50 rounded-lg'>
                    <h4 className='font-medium text-orange-900'>
                      Trade-in Opportunity
                    </h4>
                    <p className='text-sm text-orange-800'>
                      25% of enquiries include trade-in potential
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BikeEnquiryDashboard;
