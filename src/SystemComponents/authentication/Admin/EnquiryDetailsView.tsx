// src/components/admin/EnquiryDetailsView.tsx

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  MapPin,
  Clock,
  FileText,
  Edit,
  X,
  AlertCircle,
  History,
  Settings,
} from "lucide-react";
import {
  useGetEnquiryByIdQuery,
  useDeleteEnquiryMutation,
} from "../../../redux-store/services/customeRequest/enquiryApi";

interface EnquiryDetailsProps {
  onClose?: () => void;
}

const EnquiryDetailsView: React.FC<EnquiryDetailsProps> = ({ onClose }) => {
  const { id: enquiryId } = useParams<{ id: string }>();
  const [editMode, setEditMode] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    reviewNotes: "",
  });

  const {
    data: enquiryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetEnquiryByIdQuery(enquiryId ?? "");

  const [deleteEnquiry, { isLoading: isDeleting }] = useDeleteEnquiryMutation();

  const enquiry = enquiryData?.data;

  // Show error if no enquiry ID is provided
  if (!enquiryId) {
    return (
      <Alert className='border-red-200 bg-red-50'>
        <AlertCircle className='h-4 w-4 text-red-600' />
        <AlertDescription className='text-red-800'>
          <strong>Error:</strong> No enquiry ID provided. Please navigate to an
          enquiry from the list.
        </AlertDescription>
      </Alert>
    );
  }

  const handleDelete = async () => {
    if (
      !enquiryId ||
      !window.confirm("Are you sure you want to delete this enquiry?")
    ) {
      return;
    }

    try {
      await deleteEnquiry(enquiryId).unwrap();
      if (onClose) onClose();
    } catch (err: any) {
      alert(`Error: ${err?.data?.message || "Failed to delete enquiry"}`);
    }
  };

  const handleStatusUpdate = async () => {
    // Status update would require a new mutation endpoint
    // Add updateEnquiryStatus mutation to enquiryApi if needed
    alert("Status update endpoint not implemented in current API");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "converted":
        return "bg-green-100 text-green-800 border-green-200";
      case "contacted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "new":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading enquiry details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    const errorMessage =
      (error as any)?.data?.message || "Failed to fetch enquiry details";
    return (
      <Alert className='border-red-200 bg-red-50'>
        <AlertCircle className='h-4 w-4 text-red-600' />
        <AlertDescription className='text-red-800'>
          <strong>Error:</strong> {errorMessage}
          <Button
            variant='outline'
            size='sm'
            className='ml-4'
            onClick={() => refetch()}
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
            <h1 className='text-2xl font-bold'>{enquiry.name}</h1>
            <Badge className={getStatusColor(enquiry.status)}>
              {enquiry.status.toUpperCase()}
            </Badge>
          </div>
          <p className='text-gray-600'>Phone: {enquiry.phoneNumber}</p>
          <p className='text-sm text-gray-500'>
            Submitted: {new Date(enquiry.createdAt).toLocaleDateString()} at{" "}
            {new Date(enquiry.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className='flex space-x-2'>
          <Button
            variant='outline'
            onClick={() => setEditMode(!editMode)}
            disabled={isDeleting}
          >
            {editMode ? (
              <X className='h-4 w-4 mr-2' />
            ) : (
              <Edit className='h-4 w-4 mr-2' />
            )}
            {editMode ? "Cancel" : "Edit Status"}
          </Button>

          <Button
            variant='outline'
            onClick={handleDelete}
            disabled={isDeleting}
            className='text-red-600 hover:text-red-700'
          >
            {isDeleting ? "Deleting..." : "Delete"}
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
          <TabsTrigger value='history'>History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <User className='h-5 w-5 mr-2' />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center space-x-3'>
                  <User className='h-4 w-4 text-gray-500' />
                  <div>
                    <p className='text-sm text-gray-600'>Name</p>
                    <p className='font-medium'>{enquiry.name}</p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <Phone className='h-4 w-4 text-gray-500' />
                  <div>
                    <p className='text-sm text-gray-600'>Phone</p>
                    <p className='font-medium'>{enquiry.phoneNumber}</p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <MapPin className='h-4 w-4 text-gray-500' />
                  <div>
                    <p className='text-sm text-gray-600'>Address</p>
                    <p className='font-medium'>
                      {enquiry.address.village}, {enquiry.address.district}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {enquiry.address.state} - {enquiry.address.pinCode}
                    </p>
                  </div>
                </div>
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
                          <SelectItem value='new'>New</SelectItem>
                          <SelectItem value='contacted'>Contacted</SelectItem>
                          <SelectItem value='converted'>Converted</SelectItem>
                          <SelectItem value='closed'>Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='reviewNotes'>Notes</Label>
                      <Textarea
                        id='reviewNotes'
                        value={statusUpdate.reviewNotes}
                        onChange={(e) =>
                          setStatusUpdate((prev) => ({
                            ...prev,
                            reviewNotes: e.target.value,
                          }))
                        }
                        placeholder='Add notes...'
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleStatusUpdate} className='w-full'>
                      Update Status
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
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value='history' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <History className='h-5 w-5 mr-2' />
                Enquiry Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-start space-x-4'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                      <FileText className='h-4 w-4 text-blue-600' />
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium'>Enquiry Submitted</h4>
                      <span className='text-sm text-gray-500'>
                        {new Date(enquiry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Initial enquiry received
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-4'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                      <Clock className='h-4 w-4 text-gray-600' />
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnquiryDetailsView;
