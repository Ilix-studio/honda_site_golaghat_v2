import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  useActivateScanFleetTokenMutation,
  useGetScanFleetProfileQuery,
} from "@/redux-store/services/Scanfleet/scanfleetApi";

export default function UseToken() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useGetScanFleetProfileQuery();
  const [activateToken, { isLoading: submitting }] =
    useActivateScanFleetTokenMutation();

  const [formData, setFormData] = useState({
    attachCode: "",
    vehicleNumber: "",
    vehicleType: "Car",
    vehicleModel: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await activateToken(formData).unwrap();
      alert(`✅ Token activated! Token ID: ${result.tokenId}`);
      navigate("/scanfleet/success");
    } catch (err: any) {
      alert(`❌ ${err?.data?.message || "Activation failed"}`);
    }
  };

  if (isLoading) {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-3/4 mb-4'></div>
          <div className='h-32 bg-gray-200 rounded mb-4'></div>
          <div className='h-12 bg-gray-200 rounded mb-2'></div>
          <div className='h-12 bg-gray-200 rounded mb-2'></div>
        </div>
      </div>
    );
  }

  if (!profile?.profileCompleted) {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6'>
          <h2 className='text-xl font-bold text-yellow-800 mb-2'>
            Profile Incomplete
          </h2>
          <p className='text-yellow-700 mb-4'>
            Please complete your profile before activating ScanFleet safety
            package.
          </p>
          <Link
            to='/customer/initialize'
            className='inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700'
          >
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>
        Activate ScanFleet Safety Package
      </h1>

      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
        <h3 className='font-bold text-blue-900 mb-3 flex items-center gap-2'>
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
            />
          </svg>
          Your Information (Auto-filled)
        </h3>
        <div className='grid md:grid-cols-2 gap-3 text-sm'>
          <div>
            <p className='text-gray-600'>Full Name</p>
            <p className='font-medium'>
              {profile.firstName} {profile.middleName} {profile.lastName}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>Phone Number</p>
            <p className='font-medium'>{profile.phoneNumber}</p>
          </div>
          <div>
            <p className='text-gray-600'>Email</p>
            <p className='font-medium'>{profile.email}</p>
          </div>
          {profile.bloodGroup && (
            <div>
              <p className='text-gray-600'>Blood Group</p>
              <p className='font-medium'>{profile.bloodGroup}</p>
            </div>
          )}
          <div>
            <p className='text-gray-600'>Emergency Contact 1</p>
            <p className='font-medium'>{profile.familyNumber1}</p>
          </div>
          {profile.familyNumber2 && (
            <div>
              <p className='text-gray-600'>Emergency Contact 2</p>
              <p className='font-medium'>{profile.familyNumber2}</p>
            </div>
          )}
          <div className='md:col-span-2'>
            <p className='text-gray-600'>Address</p>
            <p className='font-medium'>
              {profile.address.village}, {profile.address.postOffice},{" "}
              {profile.address.policeStation}, {profile.address.district},{" "}
              {profile.address.state}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block font-medium mb-1 text-gray-700'>
            Attach Code <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            placeholder='AC-XXXXXXXX'
            value={formData.attachCode}
            onChange={(e) =>
              setFormData({
                ...formData,
                attachCode: e.target.value.toUpperCase(),
              })
            }
            required
            className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <p className='text-xs text-gray-500 mt-1'>
            📦 Found on your physical sticker package
          </p>
        </div>

        <div>
          <label className='block font-medium mb-1 text-gray-700'>
            Vehicle Number <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            placeholder='AS01AB1234'
            value={formData.vehicleNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                vehicleNumber: e.target.value.toUpperCase(),
              })
            }
            required
            pattern='[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}'
            className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        <div>
          <label className='block font-medium mb-1 text-gray-700'>
            Vehicle Type <span className='text-red-500'>*</span>
          </label>
          <select
            value={formData.vehicleType}
            onChange={(e) =>
              setFormData({ ...formData, vehicleType: e.target.value })
            }
            className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option>Car</option>
            <option>Bike</option>
            <option>SUV</option>
            <option>Truck</option>
            <option>Scooter</option>
          </select>
        </div>

        <div>
          <label className='block font-medium mb-1 text-gray-700'>
            Vehicle Model <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            placeholder='Honda City, Activa 6G, etc.'
            value={formData.vehicleModel}
            onChange={(e) =>
              setFormData({ ...formData, vehicleModel: e.target.value })
            }
            required
            className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        <button
          type='submit'
          disabled={submitting}
          className='w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2'
        >
          {submitting ? (
            <>
              <svg
                className='animate-spin h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              Activating...
            </>
          ) : (
            "🛡️ Activate Safety Package"
          )}
        </button>
      </form>
    </div>
  );
}
