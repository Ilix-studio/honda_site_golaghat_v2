import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, X, MapPin, Phone, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/redux";
import { useCreateBranchMutation } from "@/redux-store/services/branchApi";
import { addNotification } from "@/redux-store/slices/uiSlice";

// Form schema
const branchSchema = z.object({
  id: z
    .string()
    .min(1, "Branch ID is required")
    .max(20, "Branch ID must be 20 characters or less"),
  name: z
    .string()
    .min(1, "Branch name is required")
    .max(100, "Branch name must be 100 characters or less"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address must be 500 characters or less"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\+]?[0-9\-\s\(\)]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address"),
  weekdayHours: z.string().min(1, "Weekday hours are required"),
  saturdayHours: z.string().min(1, "Saturday hours are required"),
  sundayHours: z.string().min(1, "Sunday hours are required"),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface StaffMember {
  name: string;
  position: string;
}

const AddBranch = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [currentStaffName, setCurrentStaffName] = useState("");
  const [currentStaffPosition, setCurrentStaffPosition] = useState("");

  const [createBranch, { isLoading }] = useCreateBranchMutation();

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      weekdayHours: "9:00 AM - 7:00 PM",
      saturdayHours: "10:00 AM - 5:00 PM",
      sundayHours: "Closed",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  // Add staff member
  const addStaffMember = () => {
    if (currentStaffName.trim() && currentStaffPosition.trim()) {
      setStaff([
        ...staff,
        {
          name: currentStaffName.trim(),
          position: currentStaffPosition.trim(),
        },
      ]);
      setCurrentStaffName("");
      setCurrentStaffPosition("");
    }
  };

  // Remove staff member
  const removeStaffMember = (index: number) => {
    setStaff(staff.filter((_, i) => i !== index));
  };

  // Handle form submission
  const onSubmit = async (data: BranchFormData) => {
    try {
      const branchData = {
        id: data.id,
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        hours: {
          weekdays: data.weekdayHours,
          saturday: data.saturdayHours,
          sunday: data.sundayHours,
        },
        staff: staff,
      };

      await createBranch(branchData).unwrap();

      dispatch(
        addNotification({
          type: "success",
          message: "Branch created successfully!",
        })
      );

      navigate("/admin/dashboard");
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.message || "Failed to create branch",
        })
      );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container max-w-4xl px-4 py-8'>
        {/* Header */}
        <div className='mb-6'>
          <Link to='/admin/dashboard'>
            <Button variant='ghost' className='pl-0'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5 text-red-600' />
                Add New Branch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                {/* Basic Information */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    Basic Information
                  </h3>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='id'>Branch ID *</Label>
                      <Input
                        id='id'
                        placeholder='e.g., golaghat, sarupathar'
                        {...register("id")}
                        className={errors.id ? "border-red-500" : ""}
                      />
                      {errors.id && (
                        <p className='text-red-500 text-sm'>
                          {errors.id.message}
                        </p>
                      )}
                      <p className='text-xs text-muted-foreground'>
                        Unique identifier for the branch (lowercase, no spaces)
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='name'>Branch Name *</Label>
                      <Input
                        id='name'
                        placeholder='e.g., Honda Motorcycles Golaghat'
                        {...register("name")}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className='text-red-500 text-sm'>
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='address'>Address *</Label>
                    <Textarea
                      id='address'
                      placeholder='Enter complete branch address'
                      {...register("address")}
                      className={errors.address ? "border-red-500" : ""}
                      rows={3}
                    />
                    {errors.address && (
                      <p className='text-red-500 text-sm'>
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold flex items-center gap-2'>
                    <Phone className='h-4 w-4' />
                    Contact Information
                  </h3>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='phone'>Phone Number *</Label>
                      <Input
                        id='phone'
                        placeholder='e.g., +91 883920-2092122'
                        {...register("phone")}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className='text-red-500 text-sm'>
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='email'>Email Address *</Label>
                      <Input
                        id='email'
                        type='email'
                        placeholder='e.g., golaghat@hondamotorcycles.com'
                        {...register("email")}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className='text-red-500 text-sm'>
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    Operating Hours
                  </h3>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='weekdayHours'>Monday - Friday *</Label>
                      <Input
                        id='weekdayHours'
                        placeholder='e.g., 9:00 AM - 7:00 PM'
                        {...register("weekdayHours")}
                        className={errors.weekdayHours ? "border-red-500" : ""}
                      />
                      {errors.weekdayHours && (
                        <p className='text-red-500 text-sm'>
                          {errors.weekdayHours.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='saturdayHours'>Saturday *</Label>
                      <Input
                        id='saturdayHours'
                        placeholder='e.g., 10:00 AM - 5:00 PM'
                        {...register("saturdayHours")}
                        className={errors.saturdayHours ? "border-red-500" : ""}
                      />
                      {errors.saturdayHours && (
                        <p className='text-red-500 text-sm'>
                          {errors.saturdayHours.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='sundayHours'>Sunday *</Label>
                      <Input
                        id='sundayHours'
                        placeholder='e.g., Closed'
                        {...register("sundayHours")}
                        className={errors.sundayHours ? "border-red-500" : ""}
                      />
                      {errors.sundayHours && (
                        <p className='text-red-500 text-sm'>
                          {errors.sundayHours.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Staff Members */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold'>
                    Staff Members (Optional)
                  </h3>

                  {/* Add Staff Form */}
                  <div className='p-4 bg-gray-50 rounded-lg'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='staffName'>Staff Name</Label>
                        <Input
                          id='staffName'
                          placeholder='Enter staff member name'
                          value={currentStaffName}
                          onChange={(e) => setCurrentStaffName(e.target.value)}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='staffPosition'>Position</Label>
                        <Input
                          id='staffPosition'
                          placeholder='e.g., Branch Manager, Sales Executive'
                          value={currentStaffPosition}
                          onChange={(e) =>
                            setCurrentStaffPosition(e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <Button
                      type='button'
                      onClick={addStaffMember}
                      disabled={
                        !currentStaffName.trim() || !currentStaffPosition.trim()
                      }
                      variant='outline'
                      className='w-full md:w-auto'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Add Staff Member
                    </Button>
                  </div>

                  {/* Staff List */}
                  {staff.length > 0 && (
                    <div className='space-y-2'>
                      <Label>Added Staff Members</Label>
                      <div className='space-y-2'>
                        {staff.map((member, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between p-3 bg-white border rounded-lg'
                          >
                            <div>
                              <p className='font-medium'>{member.name}</p>
                              <p className='text-sm text-muted-foreground'>
                                {member.position}
                              </p>
                            </div>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => removeStaffMember(index)}
                              className='text-red-600 hover:text-red-700'
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold'>Preview</h3>
                  <div className='p-4 bg-blue-50 rounded-lg'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                      <div>
                        <p>
                          <strong>Branch ID:</strong> {watch("id") || "Not set"}
                        </p>
                        <p>
                          <strong>Name:</strong> {watch("name") || "Not set"}
                        </p>
                        <p>
                          <strong>Phone:</strong> {watch("phone") || "Not set"}
                        </p>
                        <p>
                          <strong>Email:</strong> {watch("email") || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Weekdays:</strong>{" "}
                          {watch("weekdayHours") || "Not set"}
                        </p>
                        <p>
                          <strong>Saturday:</strong>{" "}
                          {watch("saturdayHours") || "Not set"}
                        </p>
                        <p>
                          <strong>Sunday:</strong>{" "}
                          {watch("sundayHours") || "Not set"}
                        </p>
                        <p>
                          <strong>Staff Count:</strong> {staff.length}
                        </p>
                      </div>
                    </div>
                    {watch("address") && (
                      <div className='mt-2'>
                        <p>
                          <strong>Address:</strong> {watch("address")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className='flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t'>
                  <Link to='/admin/dashboard'>
                    <Button variant='outline' className='w-full sm:w-auto'>
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type='submit'
                    disabled={isLoading}
                    className='w-full sm:w-auto bg-red-600 hover:bg-red-700'
                  >
                    {isLoading ? "Creating Branch..." : "Create Branch"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AddBranch;
