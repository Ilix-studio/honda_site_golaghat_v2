import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAssignToCustomerMutation,
  useGetStockItemByIdQuery,
} from "../../../redux-store/services/BikeSystemApi2/StockConceptApi";
import { toast } from "react-hot-toast";
import { useAuthForCustomer } from "@/hooks/useAuthforCustomer";

interface AssignStockFormData {
  salePrice: number;
  invoiceNumber: string;
  paymentStatus: "Paid" | "Partial" | "Pending";
  registrationDate?: string;
  numberPlate?: string;
  registeredOwnerName?: string;
  insurance: boolean;
  isPaid: boolean;
  isFinance: boolean;
  rtoName?: string;
  rtoAddress?: string;
  state: string;
}

const AssignStock = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer } = useAuthForCustomer(); // Get authenticated customer

  const { data: stockData, isLoading: stockLoading } = useGetStockItemByIdQuery(
    id!
  );
  const [assignToCustomer, { isLoading: assignLoading }] =
    useAssignToCustomerMutation();

  const [formData, setFormData] = useState<AssignStockFormData>({
    salePrice: 0,
    invoiceNumber: "",
    paymentStatus: "Pending",
    registrationDate: "",
    numberPlate: "",
    registeredOwnerName: "",
    insurance: false,
    isPaid: false,
    isFinance: false,
    rtoName: "",
    rtoAddress: "",
    state: "AS",
  });

  // Set sale price from stock data
  useEffect(() => {
    if (stockData?.data) {
      setFormData((prev) => ({
        ...prev,
        salePrice: stockData.data.priceInfo.onRoadPrice,
      }));
    }
  }, [stockData]);

  // Set registered owner name from customer data
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        registeredOwnerName:
          `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
          customer.phoneNumber,
      }));
    }
  }, [customer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("Stock ID is required");
      return;
    }

    if (!customer?.id) {
      toast.error("Customer authentication required");
      return;
    }

    try {
      const result = await assignToCustomer({
        id,
        data: {
          ...formData,
          customerId: customer.id, // Use id from customerAuthSlice
        },
      }).unwrap();

      toast.success(result.message || "Stock assigned successfully!");
      navigate("/select-VAS");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to assign stock");
      console.error("Error assigning stock:", error);
    }
  };

  if (stockLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!stockData?.data) {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <p className='text-red-600'>Stock item not found</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <p className='text-red-600'>Customer authentication required</p>
      </div>
    );
  }

  const stock = stockData.data;

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Assign Stock to Customer</h1>

      {/* Customer Info Display */}
      <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
        <h2 className='font-semibold text-lg mb-2'>Customer Information</h2>
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div>
            <span className='font-medium'>Phone:</span> {customer.phoneNumber}
          </div>
          <div>
            <span className='font-medium'>Name:</span> {customer.firstName}{" "}
            {customer.lastName}
          </div>
          <div>
            <span className='font-medium'>Customer ID:</span> {customer.id}
          </div>
        </div>
      </div>

      {/* Stock Details Card */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
        <h2 className='font-semibold text-lg mb-2'>Stock Details</h2>
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div>
            <span className='font-medium'>Stock ID:</span> {stock.stockId}
          </div>
          <div>
            <span className='font-medium'>Model:</span> {stock.modelName}
          </div>
          <div>
            <span className='font-medium'>Color:</span> {stock.color}
          </div>
          <div>
            <span className='font-medium'>Variant:</span> {stock.variant}
          </div>
          <div>
            <span className='font-medium'>Engine:</span> {stock.engineNumber}
          </div>
          <div>
            <span className='font-medium'>Chassis:</span> {stock.chassisNumber}
          </div>
          <div>
            <span className='font-medium'>Price:</span> ₹
            {stock.priceInfo.onRoadPrice.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Assignment Form */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Sale Information */}
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h3 className='text-lg font-semibold mb-4'>Sale Information</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='invoiceNumber'
                className='block text-sm font-medium mb-1'
              >
                Invoice Number *
              </label>
              <input
                type='text'
                id='invoiceNumber'
                name='invoiceNumber'
                value={formData.invoiceNumber}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label
                htmlFor='salePrice'
                className='block text-sm font-medium mb-1'
              >
                Sale Price *
              </label>
              <input
                type='number'
                id='salePrice'
                name='salePrice'
                value={formData.salePrice}
                onChange={handleChange}
                required
                min='0'
                step='0.01'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label
                htmlFor='paymentStatus'
                className='block text-sm font-medium mb-1'
              >
                Payment Status *
              </label>
              <select
                id='paymentStatus'
                name='paymentStatus'
                value={formData.paymentStatus}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='Pending'>Pending</option>
                <option value='Partial'>Partial</option>
                <option value='Paid'>Paid</option>
              </select>
            </div>

            <div>
              <label
                htmlFor='registeredOwnerName'
                className='block text-sm font-medium mb-1'
              >
                Registered Owner Name
              </label>
              <input
                type='text'
                id='registeredOwnerName'
                name='registeredOwnerName'
                value={formData.registeredOwnerName}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='md:col-span-2 flex items-center space-x-4 pt-4'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  name='isPaid'
                  checked={formData.isPaid}
                  onChange={handleChange}
                  className='mr-2'
                />
                <span className='text-sm'>Fully Paid</span>
              </label>

              <label className='flex items-center'>
                <input
                  type='checkbox'
                  name='isFinance'
                  checked={formData.isFinance}
                  onChange={handleChange}
                  className='mr-2'
                />
                <span className='text-sm'>Financed</span>
              </label>
            </div>
          </div>
        </div>

        {/* Vehicle Registration */}
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h3 className='text-lg font-semibold mb-4'>Vehicle Registration</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='numberPlate'
                className='block text-sm font-medium mb-1'
              >
                Number Plate
              </label>
              <input
                type='text'
                id='numberPlate'
                name='numberPlate'
                value={formData.numberPlate}
                onChange={handleChange}
                placeholder='e.g., AS01AB1234'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase'
              />
            </div>

            <div>
              <label
                htmlFor='registrationDate'
                className='block text-sm font-medium mb-1'
              >
                Registration Date
              </label>
              <input
                type='date'
                id='registrationDate'
                name='registrationDate'
                value={formData.registrationDate}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor='state' className='block text-sm font-medium mb-1'>
                State
              </label>
              <input
                type='text'
                id='state'
                name='state'
                value={formData.state}
                onChange={handleChange}
                placeholder='e.g., AS'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase'
              />
            </div>

            <div>
              <label
                htmlFor='rtoName'
                className='block text-sm font-medium mb-1'
              >
                RTO Name
              </label>
              <input
                type='text'
                id='rtoName'
                name='rtoName'
                value={formData.rtoName}
                onChange={handleChange}
                placeholder='Enter RTO office name'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='md:col-span-2'>
              <label
                htmlFor='rtoAddress'
                className='block text-sm font-medium mb-1'
              >
                RTO Address
              </label>
              <input
                type='text'
                id='rtoAddress'
                name='rtoAddress'
                value={formData.rtoAddress}
                onChange={handleChange}
                placeholder='Enter RTO office address'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='md:col-span-2'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  name='insurance'
                  checked={formData.insurance}
                  onChange={handleChange}
                  className='mr-2'
                />
                <span className='text-sm font-medium'>Insurance Included</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3'>
          <button
            type='submit'
            disabled={assignLoading}
            className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed'
          >
            {assignLoading ? "Assigning..." : "Assign to Customer"}
          </button>
          <button
            type='button'
            onClick={() => navigate(-1)}
            disabled={assignLoading}
            className='px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignStock;
