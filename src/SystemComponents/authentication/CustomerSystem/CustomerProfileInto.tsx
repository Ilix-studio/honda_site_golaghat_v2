import React from "react";
import { useGetCustomerProfileQuery } from "@/redux-store/services/customer/customerApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { User, Phone, Mail, Loader2, AlertCircle } from "lucide-react";

// Interface that matches the actual API response
export interface CustomerProfile {
  _id: string;
  customer: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  village: string;
  postOffice: string;
  policeStation: string;
  district: string;
  state: string;
  bloodGroup: string;
  familyNumber1: number;
  familyNumber2: number;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  fullName: string;
  fullAddress: string;
  id: string;
}

export interface CustomerData {
  _id: string;
  firebaseUid: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  profile: CustomerProfile;
  profileCompleted: boolean;
}

export interface ApiResponse {
  success: boolean;
  data: CustomerData;
}

const CustomerProfileInto: React.FC = () => {
  const { data, isLoading, isError } = useGetCustomerProfileQuery();

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin text-red-600' />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center p-8'>
          <div className='text-center'>
            <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-red-800 mb-2'>
              Error Loading Profile
            </h3>
            <p className='text-red-600'>
              Failed to load customer profile. Please try again.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const apiResponse = data as unknown as ApiResponse;

  if (!apiResponse?.success || !apiResponse?.data) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center p-8'>
          <div className='text-center'>
            <AlertCircle className='h-12 w-12 text-yellow-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-yellow-800 mb-2'>
              No Profile Data
            </h3>
            <p className='text-yellow-600'>
              Customer profile data is not available.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const customer = apiResponse.data;
  const profile = customer.profile;

  if (!profile) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center p-8'>
          <div className='text-center'>
            <User className='h-12 w-12 text-blue-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-blue-800 mb-2'>
              Profile Incomplete
            </h3>
            <p className='text-blue-600 mb-4'>
              Please complete your profile to view all information.
            </p>
            <div className='text-sm text-blue-500 space-y-1'>
              <p>Phone: {customer.phoneNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header with Status */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center text-xl'>
                <User className='w-6 h-6 mr-2 text-red-600' />
                {profile.fullName}
              </CardTitle>
              <p className='text-gray-600 mt-1'>Customer Profile Information</p>
            </div>
            <div className='flex gap-2'>
              <Badge
                variant='outline'
                className={`${
                  customer.isVerified
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {customer.isVerified ? "✓ Verified" : "✗ Not Verified"}
              </Badge>
              <Badge
                variant='outline'
                className={`${
                  profile.profileCompleted
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}
              >
                {profile.profileCompleted ? "✓ Complete" : "⚠ Incomplete"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Information Cards */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <User className='w-5 h-5 mr-2 text-red-600' />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                First Name
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {profile.firstName}
              </p>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-500'>
                Last Name
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {profile.lastName}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Phone className='w-5 h-5 mr-2 text-red-600' />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-gray-500 flex items-center'>
                <Phone className='w-4 h-4 mr-1' />
                Phone Number
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {customer.phoneNumber}
              </p>
            </div>

            {profile.email && (
              <div>
                <label className='text-sm font-medium text-gray-500 flex items-center'>
                  <Mail className='w-4 h-4 mr-1' />
                  Email Address
                </label>
                <p className='text-lg font-semibold text-gray-900'>
                  {profile.email}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfileInto;
