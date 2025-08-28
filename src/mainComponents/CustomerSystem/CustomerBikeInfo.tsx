import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  MapPin,
  Settings,
  User,
  Hash,
  Camera,
  Shield,
  Star,
} from "lucide-react";

import cbr from "../../assets/cbr-1000-rrr.jpg";
// import AMC from "../../assets/VAS/AMC.png";
// import TFS from "../../assets/VAS/TFS.png";
// import VAS from "../../assets/VAS/VAS.png";
import { ReactNode } from "react";

// Type definitions
interface ServiceBadgeProps {
  title: string;
  subtitle: string;
  gradient: string;
  shadowColor: string;
  icon: ReactNode;
}

// Mock customer motorcycle data
const customerBike = {
  id: 1,
  name: "Honda CB125 Hornet",
  model: "CB125 Hornet",
  year: 2023,
  engineNumber: "CB125E-2301234",
  chassisNumber: "ME4KC0410P5012345",
  ownerName: "Ilix Hazarika",
  numberPlate: "AS05-AB-1234",
  photo: "/honda-cb125-hornet-motorcycle-yellow-black.png",
  rtoInfo: {
    rtoCode: "AS-05",
    rtoName: "Golaghat, Asaam",
    registrationDate: "2023-03-15",
  },
  fitnessUpTo: "2038-03-14",
  vehicleAge: "1 year 5 months",
  color: "Yellow & Black",
  fuelType: "Petrol",
  engineCapacity: "124.7cc",
  mileage: "65 KMPL",
  transmission: "Manual",
  status: "Active",
};

export function CustomerBikeInfo() {
  const calculateAge = (registrationDate: string) => {
    const regDate = new Date(registrationDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - regDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return `${years} year${years !== 1 ? "s" : ""} ${months} month${
      months !== 1 ? "s" : ""
    }`;
  };

  const ServiceBadge = ({
    title,
    subtitle,
    gradient,
    shadowColor,
    icon,
  }: ServiceBadgeProps) => (
    <div className='relative group'>
      <div
        className={`flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br ${gradient} shadow-xl ${shadowColor} border-2 border-white/20 backdrop-blur-sm transform transition-all duration-300 hover:scale-110 hover:shadow-2xl group-hover:rotate-3`}
      >
        {/* Shine effect */}
        <div className='absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

        {/* Icon */}
        <div className='text-white mb-1 transform group-hover:scale-110 transition-transform duration-200'>
          {icon}
        </div>

        {/* Text */}
        <div className='text-[7px] sm:text-[8px] lg:text-[9px] font-bold text-center leading-tight px-1 text-white/95 relative z-10'>
          <div className='tracking-wider'>{title}</div>
          <div className='font-semibold opacity-90'>{subtitle}</div>
        </div>

        {/* Pulse ring effect */}
        <div className='absolute inset-0 rounded-full border-2 border-white/30 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500'></div>
      </div>

      {/* Floating particles effect */}
      <div className='absolute -top-1 -right-1 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping'></div>
      <div className='absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping animation-delay-200'></div>
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Main Bike Information Card */}
      <Card>
        <CardHeader className='bg-white border-b'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl text-gray-900'>
                {customerBike.name}
              </CardTitle>
              <p className='text-gray-600 mt-1'>
                Registration: {customerBike.numberPlate}
              </p>
            </div>
            <Badge
              variant='outline'
              className='bg-green-50 text-green-700 border-green-200'
            >
              {customerBike.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Motorcycle Image */}
            <div className='space-y-4'>
              <div className='relative aspect-video bg-gray-100 rounded-lg overflow-hidden'>
                <img
                  src={cbr}
                  alt={customerBike.name}
                  className='object-contain'
                />
              </div>
              <Button variant='outline' className='w-full bg-transparent'>
                <Camera className='w-4 h-4 mr-2' />
                Update Photo
              </Button>
            </div>

            {/* Basic Information */}
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Model Year
                  </label>
                  <p className='text-lg font-semibold text-gray-900'>
                    {customerBike.year}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Color
                  </label>
                  <p className='text-lg font-semibold text-gray-900'>
                    {customerBike.color}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Engine Capacity
                  </label>
                  <p className='text-lg font-semibold text-gray-900'>
                    {customerBike.engineCapacity}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Mileage
                  </label>
                  <p className='text-lg font-semibold text-gray-900'>
                    {customerBike.mileage}
                  </p>
                </div>
              </div>
              <br />
              <br />
              {/* Service Badges */}
              <div className='grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-1 mt-9'>
                <div className='flex justify-start p-4 bg-white rounded-lg  transition-colors gap-3'>
                  <ServiceBadge
                    title='ANNUAL'
                    subtitle='MAINTENANCE'
                    gradient='from-indigo-500 via-white-500 to-red-500'
                    shadowColor='shadow-indigo-500/25'
                    icon={<Settings className='w-9 h-9' />}
                  />

                  <ServiceBadge
                    title='THREE YEAR FREE'
                    subtitle='SERVICE'
                    gradient='from-emerald-400 via-teal-500 to-cyan-500'
                    shadowColor='shadow-emerald-500/25'
                    icon={<Shield className='w-9 h-9' />}
                  />

                  <ServiceBadge
                    title='VALUE ADDED'
                    subtitle='SERVICE'
                    gradient='from-orange-400 via-red-500 to-pink-500'
                    shadowColor='shadow-red-500/25'
                    icon={<Star className='w-9 h-9' />}
                  />
                </div>
              </div>
              {/* <div className='grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-1 mt-9'>
                <div className='flex justify-start p-4 bg-white rounded-lg  transition-colors'>
                  <img
                    src={AMC}
                    alt='AMC Service'
                    className='w-full max-w-[100px] h-auto object-contain filter hover:scale-105 transition-transform'
                  />
                  <img
                    src={TFS}
                    alt='TFS Service'
                    className='w-full max-w-[100px] h-auto object-contain filter hover:scale-105 transition-transform'
                  />
                  <img
                    src={VAS}
                    alt='VAS Service'
                    className='w-full max-w-[100px] h-auto object-contain filter hover:scale-105 transition-transform'
                  />
                </div>
              </div> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Engine & Chassis Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Settings className='w-5 h-5 mr-2 text-red-600' />
              Technical Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-gray-500 flex items-center'>
                <Hash className='w-4 h-4 mr-1' />
                Engine Number
              </label>
              <p className='text-lg font-mono text-gray-900 bg-gray-50 p-2 rounded border'>
                {customerBike.engineNumber}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500 flex items-center'>
                <Hash className='w-4 h-4 mr-1' />
                Chassis Number
              </label>
              <p className='text-lg font-mono text-gray-900 bg-gray-50 p-2 rounded border'>
                {customerBike.chassisNumber}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Fuel Type
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {customerBike.fuelType}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Transmission
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {customerBike.transmission}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Owner & Registration Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <User className='w-5 h-5 mr-2 text-red-600' />
              Owner Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Registered Owner
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {customerBike.ownerName}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Number Plate
              </label>
              <p className='text-xl font-bold text-gray-900 bg-yellow-100 p-2 rounded border-2 border-yellow-300 text-center'>
                {customerBike.numberPlate}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500 flex items-center'>
                <Calendar className='w-4 h-4 mr-1' />
                Vehicle Age
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {calculateAge(customerBike.rtoInfo.registrationDate)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RTO & Legal Information */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <FileText className='w-5 h-5 mr-2 text-red-600' />
            RTO & Legal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label className='text-sm font-medium text-gray-500 flex items-center'>
                <MapPin className='w-4 h-4 mr-1' />
                RTO Office
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {customerBike.rtoInfo.rtoName}
              </p>
              <p className='text-sm text-gray-600'>
                Code: {customerBike.rtoInfo.rtoCode}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Registration Date
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {new Date(
                  customerBike.rtoInfo.registrationDate
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Fitness Valid Until
              </label>
              <p className='text-lg font-semibold text-green-700'>
                {new Date(customerBike.fitnessUpTo).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
              <Badge
                variant='outline'
                className='bg-green-50 text-green-700 border-green-200 mt-1'
              >
                Valid
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
