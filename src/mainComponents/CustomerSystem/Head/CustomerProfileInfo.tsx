import React from "react";
import { useGetCustomerProfileQuery } from "@/redux-store/services/customer/customerApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash,
  Shield,
  Edit,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Interface that matches the actual API response
interface CustomerProfile {
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

interface CustomerData {
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

interface ApiResponse {
  success: boolean;
  data: CustomerData;
}

const CustomerProfileInfo: React.FC = () => {
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
              <p>Customer ID: {customer._id}</p>
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

            {profile.middleName && (
              <div>
                <label className='text-sm font-medium text-gray-500'>
                  Middle Name
                </label>
                <p className='text-lg font-semibold text-gray-900'>
                  {profile.middleName}
                </p>
              </div>
            )}

            <div>
              <label className='text-sm font-medium text-gray-500'>
                Last Name
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {profile.lastName}
              </p>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-500 flex items-center'>
                <Hash className='w-4 h-4 mr-1' />
                Blood Group
              </label>
              <Badge
                variant='outline'
                className='bg-red-50 text-red-700 border-red-200 font-medium'
              >
                {profile.bloodGroup}
              </Badge>
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

            <div>
              <label className='text-sm font-medium text-gray-500'>
                Family Contact 1
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {profile.familyNumber1}
              </p>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-500'>
                Family Contact 2
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {profile.familyNumber2}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <MapPin className='w-5 h-5 mr-2 text-red-600' />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Village
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {profile.village}
              </p>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-500'>
                Post Office
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {profile.postOffice}
              </p>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-500'>
                Police Station
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {profile.policeStation}
              </p>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-500'>
                District
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {profile.district}
              </p>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-500'>State</label>
              <p className='text-lg font-semibold text-gray-900'>
                {profile.state}
              </p>
            </div>
          </div>

          <div className='mt-6 pt-4 border-t border-gray-200'>
            <label className='text-sm font-medium text-gray-500 flex items-center'>
              <MapPin className='w-4 h-4 mr-1' />
              Complete Address
            </label>
            <p className='text-lg font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg mt-2'>
              {profile.fullAddress}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Status & Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Shield className='w-5 h-5 mr-2 text-red-600' />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='text-sm font-medium text-gray-500 flex items-center'>
                <Calendar className='w-4 h-4 mr-1' />
                Account Created
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500 flex items-center'>
                <Calendar className='w-4 h-4 mr-1' />
                Last Updated
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {new Date(customer.updatedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className='mt-6 pt-4 border-t border-gray-200'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Customer ID</p>
                <p className='text-lg font-semibold text-gray-900 font-mono'>
                  {customer._id}
                </p>
              </div>
              <Button variant='outline' className='bg-transparent'>
                <Edit className='w-4 h-4 mr-2' />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfileInfo;
