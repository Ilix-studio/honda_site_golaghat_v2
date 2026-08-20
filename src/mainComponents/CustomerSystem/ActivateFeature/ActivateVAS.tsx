import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

import {
  CheckCircle,
  User,
  Shield,
  Calendar,
  DollarSign,
  Bike,
} from "lucide-react";
import {
  useActivateServiceForCustomerMutation,
  useGetAllVASQuery,
} from "@/redux-store/services/BikeSystemApi2/VASApi";
import { formatCurrency } from "@/lib/formatters";
import { selectCustomerAuth } from "@/redux-store/slices/customer/customerAuthSlice";
import { setSelectVASCompleted } from "@/redux-store/slices/setupProgressSlice";
import { useGetMyVehiclesQuery } from "@/redux-store/services/customer/customerVehicleApi";

const ActivateVAS = () => {
  const navigate = useNavigate();
  const { customer, isAuthenticated } = useAppSelector(selectCustomerAuth);
  const customerId = customer?.id;

  const {
    data: vasData,
    isLoading: vasLoading,
    error: vasError,
  } = useGetAllVASQuery({
    isActive: true,
    page: 1,
    limit: 50,
  });

  // VAS rows attach to a CustomerVehicle, so the activation endpoint 404s with
  // "No active vehicle found for this customer" when none exists. Check up
  // front rather than letting the user pick a service and hit a dead end.
  const { data: vehicleData, isLoading: vehiclesLoading } =
    useGetMyVehiclesQuery(undefined, {
      skip: !isAuthenticated || !customerId,
    });
  const hasVehicle = (vehicleData?.data?.length ?? 0) > 0;

  const [activateService, { isLoading: activatingService }] =
    useActivateServiceForCustomerMutation();

  const [activatingServiceId, setActivatingServiceId] = useState<string | null>(
    null
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!customerId || !isAuthenticated) {
      toast.error("Customer authentication required");
      navigate("/customer/login");
    }
  }, [customerId, isAuthenticated, navigate]);

  const handleActivateService = async (serviceId: string) => {
    if (!customerId || !isAuthenticated) {
      toast.error("Customer authentication required");
      return;
    }

    if (!hasVehicle) {
      toast.error("Assign a vehicle before activating a service");
      return;
    }

    setActivatingServiceId(serviceId);

    try {
      console.log("Activation request:", {
        serviceId,
        customerId,
      });

      const result = await activateService({
        serviceId,
        customerId,
      }).unwrap();

      toast.success(result.message || "VAS activated successfully!");
      dispatch(setSelectVASCompleted(true)); 
      navigate("/customer/initialize");
    } catch (error: any) {
      console.error("Full error object:", error);

      const errorMessage =
        error?.data?.message || error?.message || "Failed to activate VAS";
      toast.error(`${errorMessage} (Service ID: ${serviceId})`);
    } finally {
      setActivatingServiceId(null);
    }
  };

  if (vasLoading || vehiclesLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (vasError) {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-600'>
            Failed to load VAS services. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <p className='text-yellow-600'>Customer authentication required</p>
        </div>
      </div>
    );
  }

  // Reachable by deep link even though the checklist now disables the step.
  if (!hasVehicle) {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <div className='bg-white rounded-lg shadow-sm border p-8 text-center'>
          <Bike className='h-12 w-12 text-gray-300 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            No vehicle assigned yet
          </h2>
          <p className='text-gray-600 mb-6'>
            Value Added Services attach to a vehicle, so one has to be assigned
            before any service can be activated.
          </p>
          <button
            onClick={() => navigate("/customer/select/stock")}
            className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors'
          >
            Assign a vehicle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-6'>
      <div className='bg-white rounded-lg shadow-sm border'>
        <div className='p-6 border-b border-gray-200'>
          <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            <Shield className='h-6 w-6 text-blue-600' />
            Activate Value Added Service
          </h1>
          <p className='text-gray-600 mt-1'>
            Choose a VAS to activate additional protection and benefits
          </p>
        </div>

        <div className='p-6 bg-blue-50 border-b border-gray-200'>
          <div className='flex items-center gap-2 mb-3'>
            <User className='h-5 w-5 text-blue-600' />
            <h2 className='font-semibold text-lg text-gray-900'>
              Customer Information
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='font-medium text-gray-700'>Phone:</span>
              <span className='ml-2 text-gray-900'>{customer.phoneNumber}</span>
            </div>
            <div>
              <span className='font-medium text-gray-700'>Customer ID:</span>
              <span className='ml-2 text-gray-900'>{customerId}</span>
            </div>
            {customer.firstName && (
              <div>
                <span className='font-medium text-gray-700'>Name:</span>
                <span className='ml-2 text-gray-900'>
                  {customer.firstName} {customer.lastName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VAS Services Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {vasData?.data?.map((vas) => (
          <div
            key={vas._id}
            className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'
          >
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  {vas.serviceName}
                </h3>
                <Shield className='h-6 w-6 text-blue-600' />
              </div>

              <div className='space-y-3 mb-6'>
                <div className='flex items-center gap-2'>
                  <DollarSign className='h-4 w-4 text-green-600' />
                  <span className='text-sm text-gray-700'>Base Price:</span>
                  <span className='font-semibold text-green-600'>
                    {formatCurrency(vas.priceStructure.basePrice)}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-blue-600' />
                  <span className='text-sm text-gray-700'>Coverage:</span>
                  <span className='font-semibold text-gray-900'>
                    {vas.coverageYears} years
                  </span>
                </div>

                {vas.description && (
                  <div className='text-sm text-gray-600 mt-3'>
                    {vas.description}
                  </div>
                )}
              </div>

              {vas.benefits && vas.benefits.length > 0 && (
                <div className='mb-6'>
                  <h4 className='font-medium text-gray-700 mb-2'>Benefits:</h4>
                  <ul className='space-y-1'>
                    {vas.benefits
                      .slice(0, 3)
                      .map((benefit: string, index: number) => (
                        <li key={index} className='flex items-start text-sm'>
                          <CheckCircle className='h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0' />
                          <span className='text-gray-600'>{benefit}</span>
                        </li>
                      ))}
                    {vas.benefits.length > 3 && (
                      <li className='text-sm text-gray-500 ml-6'>
                        +{vas.benefits.length - 3} more benefits
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <button
                onClick={() => {
                  console.log("Activating VAS:", {
                    serviceId: vas._id,
                    serviceName: vas.serviceName,
                    customerId: customerId,
                    isActive: vas.isActive,
                  });
                  handleActivateService(vas._id);
                }}
                disabled={activatingService && activatingServiceId === vas._id}
                className='w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors'
              >
                {activatingService && activatingServiceId === vas._id ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Activating...
                  </>
                ) : (
                  <>
                    <Shield className='h-4 w-4' />
                    Activate Service
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!vasData?.data || vasData.data.length === 0) && (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-8 text-center'>
          <Shield className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No VAS Services Available
          </h3>
          <p className='text-gray-600'>
            There are currently no active VAS services available for activation.
          </p>
        </div>
      )}

      <div className='flex justify-center'>
        <button
          type='button'
          onClick={() => navigate(-1)}
          disabled={activatingService}
          className='px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ActivateVAS;
