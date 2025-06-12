// Admin Enquiry Details View Component
// src/components/admin/EnquiryDetailsView.tsx

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Bike,
  DollarSign,
  Clock,
  Star,
  FileText,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  History,
  Target,
  Award,
  Settings,
  Eye,
} from "lucide-react";

// Types for the component
interface EnquiryDetailsProps {
  enquiryId: string;
  onClose?: () => void;
  onUpdate?: (updatedEnquiry: any) => void;
}

interface EnquiryData {
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
  bikeEnquiry?: {
    bikeId?: string;
    bikeModel?: string;
    category?: string;
    priceRange?: { min: number; max: number };
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
  };
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

interface BikeRecommendation {
  _id: string;
  modelName: string;
  category: string;
  price: number;
  images: string[];
  affordabilityScore: number;
  estimatedEMI: number;
  recommended: boolean;
  features: string[];
}

const EnquiryDetailsView: React.FC<EnquiryDetailsProps> = ({
  enquiryId,
  onClose,
  onUpdate,
}) => {
  // State management
  const [enquiry, setEnquiry] = useState<EnquiryData | null>(null);
  const [recommendations, setRecommendations] = useState<BikeRecommendation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    reviewNotes: "",
    preApprovalAmount: "",
    preApprovalValidDays: "30",
  });

  // Load enquiry data
  useEffect(() => {
    loadEnquiryData();
  }, [enquiryId]);

  const loadEnquiryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch enquiry details
      const response = await fetch(`/api/getapproved/${enquiryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch enquiry details");
      }

      const result = await response.json();

      if (result.success) {
        setEnquiry(result.data);
        setStatusUpdate({
          status: result.data.status,
          reviewNotes: result.data.reviewNotes || "",
          preApprovalAmount: result.data.preApprovalAmount?.toString() || "",
          preApprovalValidDays: "30",
        });

        // Load bike recommendations if it's a bike enquiry
        if (result.data.enquiryType !== "general-financing") {
          loadBikeRecommendations();
        }
      } else {
        throw new Error(result.message || "Failed to fetch enquiry");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBikeRecommendations = async () => {
    try {
      const response = await fetch(
        `/api/getapproved/${enquiryId}/bike-recommendations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRecommendations(result.data.recommendations || []);
        }
      }
    } catch (err) {
      console.error("Failed to load bike recommendations:", err);
    }
  };

  const handleStatusUpdate = async () => {
    if (!enquiry) return;

    try {
      setUpdating(true);

      const updateData = {
        status: statusUpdate.status,
        reviewNotes: statusUpdate.reviewNotes,
        ...(statusUpdate.status === "pre-approved" &&
          statusUpdate.preApprovalAmount && {
            preApprovalAmount: parseFloat(statusUpdate.preApprovalAmount),
            preApprovalValidDays: parseInt(statusUpdate.preApprovalValidDays),
          }),
      };

      const response = await fetch(`/api/getapproved/${enquiryId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        setEnquiry(result.data);
        setEditMode(false);
        if (onUpdate) onUpdate(result.data);

        // Show success message
        alert("Enquiry status updated successfully!");
      } else {
        throw new Error(result.message || "Failed to update status");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pre-approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "under-review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "immediate":
        return "bg-red-100 text-red-800";
      case "within-month":
        return "bg-orange-100 text-orange-800";
      case "within-3months":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading enquiry details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className='border-red-200 bg-red-50'>
        <AlertCircle className='h-4 w-4 text-red-600' />
        <AlertDescription className='text-red-800'>
          <strong>Error:</strong> {error}
          <Button
            variant='outline'
            size='sm'
            className='ml-4'
            onClick={loadEnquiryData}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!enquiry) {
    return (
      <Alert className='border-yellow-200 bg-yellow-50'>
        <AlertCircle className='h-4 w-4 text-yellow-600' />
        <AlertDescription className='text-yellow-800'>
          Enquiry not found
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-start'>
        <div>
          <div className='flex items-center space-x-3 mb-2'>
            <h1 className='text-2xl font-bold'>
              {enquiry.firstName} {enquiry.lastName}
            </h1>
            <Badge className={getStatusColor(enquiry.status)}>
              {enquiry.status.toUpperCase()}
            </Badge>
            <Badge variant='outline'>
              {enquiry.enquiryType.replace("-", " ").toUpperCase()}
            </Badge>
          </div>
          <p className='text-gray-600'>
            Application ID: {enquiry.applicationId}
          </p>
          <p className='text-sm text-gray-500'>
            Submitted: {new Date(enquiry.createdAt).toLocaleDateString()} at{" "}
            {new Date(enquiry.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className='flex space-x-2'>
          <Button
            variant='outline'
            onClick={() => setEditMode(!editMode)}
            disabled={updating}
          >
            {editMode ? (
              <X className='h-4 w-4 mr-2' />
            ) : (
              <Edit className='h-4 w-4 mr-2' />
            )}
            {editMode ? "Cancel" : "Edit Status"}
          </Button>

          {onClose && (
            <Button variant='outline' onClick={onClose}>
              <X className='h-4 w-4 mr-2' />
              Close
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue='overview' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='bike-details'>Bike Preferences</TabsTrigger>
          <TabsTrigger value='recommendations'>Recommendations</TabsTrigger>
          <TabsTrigger value='history'>History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <User className='h-5 w-5 mr-2' />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center space-x-3'>
                  <Mail className='h-4 w-4 text-gray-500' />
                  <div>
                    <p className='text-sm text-gray-600'>Email</p>
                    <p className='font-medium'>{enquiry.email}</p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <Phone className='h-4 w-4 text-gray-500' />
                  <div>
                    <p className='text-sm text-gray-600'>Phone</p>
                    <p className='font-medium'>{enquiry.phone}</p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <DollarSign className='h-4 w-4 text-gray-500' />
                  <div>
                    <p className='text-sm text-gray-600'>Monthly Income</p>
                    <p className='font-medium'>
                      {formatCurrency(enquiry.monthlyIncome)}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <Star className='h-4 w-4 text-gray-500' />
                  <div>
                    <p className='text-sm text-gray-600'>Credit Score</p>
                    <p className='font-medium capitalize'>
                      {enquiry.creditScoreRange}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <Target className='h-4 w-4 text-gray-500' />
                  <div>
                    <p className='text-sm text-gray-600'>Employment</p>
                    <p className='font-medium capitalize'>
                      {enquiry.employmentType.replace("-", " ")}
                    </p>
                  </div>
                </div>

                {enquiry.branch && (
                  <div className='flex items-center space-x-3'>
                    <MapPin className='h-4 w-4 text-gray-500' />
                    <div>
                      <p className='text-sm text-gray-600'>Branch</p>
                      <p className='font-medium'>{enquiry.branch.name}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Settings className='h-5 w-5 mr-2' />
                  Status Management
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {editMode ? (
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='status'>Status</Label>
                      <Select
                        value={statusUpdate.status}
                        onValueChange={(value) =>
                          setStatusUpdate((prev) => ({
                            ...prev,
                            status: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='pending'>Pending</SelectItem>
                          <SelectItem value='under-review'>
                            Under Review
                          </SelectItem>
                          <SelectItem value='pre-approved'>
                            Pre-approved
                          </SelectItem>
                          <SelectItem value='approved'>Approved</SelectItem>
                          <SelectItem value='rejected'>Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {statusUpdate.status === "pre-approved" && (
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <Label htmlFor='preApprovalAmount'>Amount (₹)</Label>
                          <Input
                            id='preApprovalAmount'
                            type='number'
                            value={statusUpdate.preApprovalAmount}
                            onChange={(e) =>
                              setStatusUpdate((prev) => ({
                                ...prev,
                                preApprovalAmount: e.target.value,
                              }))
                            }
                            placeholder='Pre-approval amount'
                          />
                        </div>
                        <div>
                          <Label htmlFor='validDays'>Valid Days</Label>
                          <Input
                            id='validDays'
                            type='number'
                            value={statusUpdate.preApprovalValidDays}
                            onChange={(e) =>
                              setStatusUpdate((prev) => ({
                                ...prev,
                                preApprovalValidDays: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor='reviewNotes'>Review Notes</Label>
                      <Textarea
                        id='reviewNotes'
                        value={statusUpdate.reviewNotes}
                        onChange={(e) =>
                          setStatusUpdate((prev) => ({
                            ...prev,
                            reviewNotes: e.target.value,
                          }))
                        }
                        placeholder='Add review notes...'
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleStatusUpdate}
                      disabled={updating}
                      className='w-full'
                    >
                      {updating ? "Updating..." : "Update Status"}
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div>
                      <p className='text-sm text-gray-600'>Current Status</p>
                      <Badge className={getStatusColor(enquiry.status)}>
                        {enquiry.status.toUpperCase()}
                      </Badge>
                    </div>

                    {enquiry.preApprovalAmount && (
                      <div>
                        <p className='text-sm text-gray-600'>
                          Pre-approval Amount
                        </p>
                        <p className='font-medium text-lg text-green-600'>
                          {formatCurrency(enquiry.preApprovalAmount)}
                        </p>
                        {enquiry.preApprovalValidUntil && (
                          <p className='text-xs text-gray-500'>
                            Valid until:{" "}
                            {new Date(
                              enquiry.preApprovalValidUntil
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {enquiry.reviewedBy && (
                      <div>
                        <p className='text-sm text-gray-600'>Reviewed By</p>
                        <p className='font-medium'>{enquiry.reviewedBy.name}</p>
                        <p className='text-xs text-gray-500'>
                          {enquiry.reviewedAt &&
                            new Date(enquiry.reviewedAt).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {enquiry.reviewNotes && (
                      <div>
                        <p className='text-sm text-gray-600'>Review Notes</p>
                        <p className='text-sm bg-gray-50 p-3 rounded border'>
                          {enquiry.reviewNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button variant='outline' className='w-full justify-start'>
                  <Mail className='h-4 w-4 mr-2' />
                  Send Email
                </Button>

                <Button variant='outline' className='w-full justify-start'>
                  <Phone className='h-4 w-4 mr-2' />
                  Call Customer
                </Button>

                <Button variant='outline' className='w-full justify-start'>
                  <FileText className='h-4 w-4 mr-2' />
                  Generate Report
                </Button>

                <Button variant='outline' className='w-full justify-start'>
                  <MessageSquare className='h-4 w-4 mr-2' />
                  Add Note
                </Button>

                {enquiry.enquiryType !== "general-financing" && (
                  <Button variant='outline' className='w-full justify-start'>
                    <Bike className='h-4 w-4 mr-2' />
                    View Recommendations
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='text-center p-4 bg-blue-50 rounded-lg'>
                  <h3 className='text-sm font-medium text-blue-900'>
                    Monthly Income
                  </h3>
                  <p className='text-2xl font-bold text-blue-700'>
                    {formatCurrency(enquiry.monthlyIncome)}
                  </p>
                </div>

                <div className='text-center p-4 bg-green-50 rounded-lg'>
                  <h3 className='text-sm font-medium text-green-900'>
                    Max Loan Estimate
                  </h3>
                  <p className='text-2xl font-bold text-green-700'>
                    {formatCurrency(enquiry.monthlyIncome * 24)}
                  </p>
                  <p className='text-xs text-green-600'>24x monthly income</p>
                </div>

                <div className='text-center p-4 bg-orange-50 rounded-lg'>
                  <h3 className='text-sm font-medium text-orange-900'>
                    Credit Score
                  </h3>
                  <p className='text-2xl font-bold text-orange-700 capitalize'>
                    {enquiry.creditScoreRange}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bike Details Tab */}
        <TabsContent value='bike-details' className='space-y-6'>
          {enquiry.bikeEnquiry ? (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Bike Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Bike className='h-5 w-5 mr-2' />
                    Bike Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {enquiry.bikeEnquiry.bikeModel && (
                    <div>
                      <p className='text-sm text-gray-600'>Preferred Model</p>
                      <p className='font-medium text-lg'>
                        {enquiry.bikeEnquiry.bikeModel}
                      </p>
                    </div>
                  )}

                  {enquiry.bikeEnquiry.category && (
                    <div>
                      <p className='text-sm text-gray-600'>Category</p>
                      <Badge variant='outline' className='capitalize'>
                        {enquiry.bikeEnquiry.category}
                      </Badge>
                    </div>
                  )}

                  {enquiry.bikeEnquiry.priceRange && (
                    <div>
                      <p className='text-sm text-gray-600'>Price Range</p>
                      <p className='font-medium'>
                        {formatCurrency(enquiry.bikeEnquiry.priceRange.min)} -{" "}
                        {formatCurrency(enquiry.bikeEnquiry.priceRange.max)}
                      </p>
                    </div>
                  )}

                  {enquiry.bikeEnquiry.intendedUse && (
                    <div>
                      <p className='text-sm text-gray-600'>Intended Use</p>
                      <p className='font-medium capitalize'>
                        {enquiry.bikeEnquiry.intendedUse.replace("-", " ")}
                      </p>
                    </div>
                  )}

                  {enquiry.bikeEnquiry.previousBikeExperience && (
                    <div>
                      <p className='text-sm text-gray-600'>Riding Experience</p>
                      <p className='font-medium capitalize'>
                        {enquiry.bikeEnquiry.previousBikeExperience.replace(
                          "-",
                          " "
                        )}
                      </p>
                    </div>
                  )}

                  {enquiry.bikeEnquiry.urgency && (
                    <div>
                      <p className='text-sm text-gray-600'>Purchase Timeline</p>
                      <Badge
                        className={getUrgencyColor(enquiry.bikeEnquiry.urgency)}
                      >
                        {enquiry.bikeEnquiry.urgency
                          .replace("-", " ")
                          .toUpperCase()}
                      </Badge>
                    </div>
                  )}

                  {enquiry.bikeEnquiry.preferredFeatures &&
                    enquiry.bikeEnquiry.preferredFeatures.length > 0 && (
                      <div>
                        <p className='text-sm text-gray-600 mb-2'>
                          Preferred Features
                        </p>
                        <div className='flex flex-wrap gap-2'>
                          {enquiry.bikeEnquiry.preferredFeatures.map(
                            (feature, index) => (
                              <Badge
                                key={index}
                                variant='outline'
                                className='text-xs'
                              >
                                {feature}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {enquiry.bikeEnquiry.additionalRequirements && (
                    <div>
                      <p className='text-sm text-gray-600'>
                        Additional Requirements
                      </p>
                      <p className='text-sm bg-gray-50 p-3 rounded border'>
                        {enquiry.bikeEnquiry.additionalRequirements}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trade-in Information */}
              {enquiry.bikeEnquiry.tradeInBike?.hasTradeIn && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <DollarSign className='h-5 w-5 mr-2' />
                      Trade-in Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <p className='text-sm text-gray-600'>Current Bike</p>
                      <p className='font-medium'>
                        {enquiry.bikeEnquiry.tradeInBike.currentBikeModel}
                      </p>
                    </div>

                    {enquiry.bikeEnquiry.tradeInBike.currentBikeYear && (
                      <div>
                        <p className='text-sm text-gray-600'>Year</p>
                        <p className='font-medium'>
                          {enquiry.bikeEnquiry.tradeInBike.currentBikeYear}
                        </p>
                      </div>
                    )}

                    {enquiry.bikeEnquiry.tradeInBike.condition && (
                      <div>
                        <p className='text-sm text-gray-600'>Condition</p>
                        <Badge variant='outline' className='capitalize'>
                          {enquiry.bikeEnquiry.tradeInBike.condition}
                        </Badge>
                      </div>
                    )}

                    {enquiry.bikeEnquiry.tradeInBike.estimatedValue && (
                      <div>
                        <p className='text-sm text-gray-600'>Estimated Value</p>
                        <p className='font-medium text-lg text-green-600'>
                          {formatCurrency(
                            enquiry.bikeEnquiry.tradeInBike.estimatedValue
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                This is a general financing enquiry without specific bike
                preferences.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value='recommendations' className='space-y-6'>
          {recommendations.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {recommendations.map((bike) => (
                <Card
                  key={bike._id}
                  className={`${
                    bike.recommended ? "border-green-500 bg-green-50" : ""
                  }`}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex justify-between items-start'>
                      <CardTitle className='text-lg'>
                        {bike.modelName}
                      </CardTitle>
                      {bike.recommended && (
                        <Badge className='bg-green-600'>
                          <Award className='h-3 w-3 mr-1' />
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className='text-sm text-gray-600 capitalize'>
                      {bike.category}
                    </p>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    {bike.images?.[0] && (
                      <img
                        src={bike.images[0]}
                        alt={bike.modelName}
                        className='w-full h-32 object-cover rounded'
                      />
                    )}

                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Price</span>
                        <span className='font-medium'>
                          {formatCurrency(bike.price)}
                        </span>
                      </div>

                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Est. EMI</span>
                        <span className='font-medium'>
                          {formatCurrency(bike.estimatedEMI)}/mo
                        </span>
                      </div>

                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>
                          Affordability
                        </span>
                        <div className='flex items-center space-x-2'>
                          <div className='w-16 bg-gray-200 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full ${
                                bike.affordabilityScore >= 0.8
                                  ? "bg-green-600"
                                  : bike.affordabilityScore >= 0.6
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                              }`}
                              style={{
                                width: `${bike.affordabilityScore * 100}%`,
                              }}
                            />
                          </div>
                          <span className='text-xs font-medium'>
                            {Math.round(bike.affordabilityScore * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {bike.features && bike.features.length > 0 && (
                      <div>
                        <p className='text-xs text-gray-600 mb-1'>
                          Key Features
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {bike.features.slice(0, 3).map((feature, idx) => (
                            <Badge
                              key={idx}
                              variant='outline'
                              className='text-xs'
                            >
                              {feature}
                            </Badge>
                          ))}
                          {bike.features.length > 3 && (
                            <Badge variant='outline' className='text-xs'>
                              +{bike.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <Button
                      variant={bike.recommended ? "default" : "outline"}
                      size='sm'
                      className='w-full'
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <Bike className='h-12 w-12 mx-auto mb-4 text-gray-400' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No Recommendations Available
              </h3>
              <p className='text-gray-600 mb-4'>
                Bike recommendations will appear here once the system analyzes
                the enquiry.
              </p>
              <Button onClick={loadBikeRecommendations} variant='outline'>
                <TrendingUp className='h-4 w-4 mr-2' />
                Generate Recommendations
              </Button>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value='history' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <History className='h-5 w-5 mr-2' />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Application Submitted */}
                <div className='flex items-start space-x-4'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                      <FileText className='h-4 w-4 text-blue-600' />
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium'>Application Submitted</h4>
                      <span className='text-sm text-gray-500'>
                        {new Date(enquiry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      {enquiry.enquiryType === "specific-bike"
                        ? "Bike-specific financing"
                        : enquiry.enquiryType === "trade-in"
                        ? "Trade-in financing"
                        : "General financing"}{" "}
                      enquiry submitted
                    </p>
                  </div>
                </div>

                {/* Status Updates */}
                {enquiry.reviewedAt && (
                  <div className='flex items-start space-x-4'>
                    <div className='flex-shrink-0'>
                      <div className='w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center'>
                        <Eye className='h-4 w-4 text-yellow-600' />
                      </div>
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-medium'>Application Reviewed</h4>
                        <span className='text-sm text-gray-500'>
                          {new Date(enquiry.reviewedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600'>
                        Reviewed by {enquiry.reviewedBy?.name}
                      </p>
                      {enquiry.reviewNotes && (
                        <div className='mt-2 p-2 bg-gray-50 rounded text-sm'>
                          {enquiry.reviewNotes}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Current Status */}
                <div className='flex items-start space-x-4'>
                  <div className='flex-shrink-0'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        enquiry.status === "approved"
                          ? "bg-green-100"
                          : enquiry.status === "pre-approved"
                          ? "bg-blue-100"
                          : enquiry.status === "rejected"
                          ? "bg-red-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {enquiry.status === "approved" ||
                      enquiry.status === "pre-approved" ? (
                        <CheckCircle
                          className={`h-4 w-4 ${
                            enquiry.status === "approved"
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        />
                      ) : enquiry.status === "rejected" ? (
                        <X className='h-4 w-4 text-red-600' />
                      ) : (
                        <Clock className='h-4 w-4 text-gray-600' />
                      )}
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium'>
                        Current Status: {enquiry.status.toUpperCase()}
                      </h4>
                      <span className='text-sm text-gray-500'>
                        {new Date(enquiry.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    {enquiry.preApprovalAmount && (
                      <p className='text-sm text-green-600 font-medium'>
                        Pre-approved for{" "}
                        {formatCurrency(enquiry.preApprovalAmount)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-gray-600'>Application ID</p>
                  <p className='font-mono'>{enquiry.applicationId}</p>
                </div>
                <div>
                  <p className='text-gray-600'>Database ID</p>
                  <p className='font-mono'>{enquiry._id}</p>
                </div>
                <div>
                  <p className='text-gray-600'>Created At</p>
                  <p>{new Date(enquiry.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className='text-gray-600'>Last Updated</p>
                  <p>{new Date(enquiry.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className='text-gray-600'>Terms Accepted</p>
                  <p
                    className={
                      enquiry.termsAccepted ? "text-green-600" : "text-red-600"
                    }
                  >
                    {enquiry.termsAccepted ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className='text-gray-600'>Privacy Policy Accepted</p>
                  <p
                    className={
                      enquiry.privacyPolicyAccepted
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {enquiry.privacyPolicyAccepted ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnquiryDetailsView;
