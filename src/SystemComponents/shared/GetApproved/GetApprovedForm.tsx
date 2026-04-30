// GetApprovedForm.tsx
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bike,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useGetBikesQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";
import { Bike as BikeType } from "@/redux-store/slices/BikeSystemSlice/bikesSlice";

interface GetApprovedFormProps {
  selectedBike?: BikeType;
  onSubmit?: (data: any) => void;
  className?: string;
}

interface FormData {
  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employmentType: string;
  monthlyIncome: string;
  creditScoreRange: string;

  // Bike enquiry
  bikeId: string;
  bikeModel: string;
  category: string;
  priceRange: {
    min: string;
    max: string;
  };
  preferredFeatures: string[];
  intendedUse: string;
  previousBikeExperience: string;
  urgency: string;
  additionalRequirements: string;

  // Trade-in info
  hasTradeIn: boolean;
  currentBikeModel: string;
  currentBikeYear: string;
  estimatedValue: string;
  tradeInCondition: string;

  // Terms
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  employmentType: "",
  monthlyIncome: "",
  creditScoreRange: "",
  bikeId: "",
  bikeModel: "",
  category: "",
  priceRange: { min: "", max: "" },
  preferredFeatures: [],
  intendedUse: "",
  previousBikeExperience: "",
  urgency: "exploring",
  additionalRequirements: "",
  hasTradeIn: false,
  currentBikeModel: "",
  currentBikeYear: "",
  estimatedValue: "",
  tradeInCondition: "",
  termsAccepted: false,
  privacyPolicyAccepted: false,
};

export const GetApprovedForm: React.FC<GetApprovedFormProps> = ({
  selectedBike,
  onSubmit,
  className = "",
}) => {
  // Form state
  const [formData, setFormData] = useState<FormData>(() => ({
    ...initialFormData,
    bikeId: selectedBike?._id || "",
    bikeModel: selectedBike?.modelName || "",
    category: selectedBike?.category || "",
    priceRange: {
      min: selectedBike?.priceBreakdown?.exShowroomPrice?.toString() || "",
      max:
        selectedBike?.priceBreakdown?.onRoadPrice?.toString() ||
        selectedBike?.priceBreakdown?.exShowroomPrice?.toString() ||
        "",
    },
  }));

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get available bikes for selection
  const { data: bikesResponse, isLoading: bikesLoading } = useGetBikesQuery({
    limit: 100,
    inStock: true,
  });

  // Extract bikes array safely from response
  const availableBikes = useMemo(() => {
    if (!bikesResponse?.data?.bikes) return [];
    return bikesResponse.data.bikes;
  }, [bikesResponse]);

  // Configuration data
  const categories = useMemo(
    () => [
      "sport",
      "adventure",
      "cruiser",
      "touring",
      "naked",
      "electric",
      "commuter",
      "automatic",
      "gearless",
    ],
    []
  );

  const features = useMemo(
    () => [
      "ABS",
      "LED Headlights",
      "Digital Display",
      "Bluetooth Connectivity",
      "USB Charging",
      "Disc Brakes",
      "Tubeless Tyres",
      "Electric Start",
      "Kick Start",
      "Fuel Injection",
      "Carburetor",
      "Single Cylinder",
      "Twin Cylinder",
      "Liquid Cooled",
      "Air Cooled",
    ],
    []
  );

  const intendedUses = useMemo(
    () => [
      { value: "daily-commute", label: "Daily Commute" },
      { value: "long-touring", label: "Long Distance Touring" },
      { value: "sport-riding", label: "Sport Riding" },
      { value: "off-road", label: "Off-road Adventures" },
      { value: "leisure", label: "Leisure Riding" },
      { value: "business", label: "Business Use" },
    ],
    []
  );

  const experienceLevels = useMemo(
    () => [
      { value: "first-time", label: "First Time Buyer" },
      { value: "beginner", label: "Beginner (0-2 years)" },
      { value: "intermediate", label: "Intermediate (3-5 years)" },
      { value: "experienced", label: "Experienced (5+ years)" },
    ],
    []
  );

  const urgencyOptions = useMemo(
    () => [
      { value: "immediate", label: "Immediate (Within 1 week)" },
      { value: "within-month", label: "Within a month" },
      { value: "within-3months", label: "Within 3 months" },
      { value: "exploring", label: "Just exploring options" },
    ],
    []
  );

  const employmentTypes = useMemo(
    () => [
      { value: "salaried", label: "Salaried" },
      { value: "self-employed", label: "Self-Employed" },
      { value: "business-owner", label: "Business Owner" },
      { value: "retired", label: "Retired" },
      { value: "student", label: "Student" },
    ],
    []
  );

  const creditScoreRanges = useMemo(
    () => [
      { value: "excellent", label: "Excellent (750+)" },
      { value: "good", label: "Good (700-749)" },
      { value: "fair", label: "Fair (650-699)" },
      { value: "poor", label: "Poor (below 650)" },
    ],
    []
  );

  // Form handlers
  const updateField = useCallback(
    (field: keyof FormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const updateNestedField = useCallback(
    (parent: string, field: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as any),
          [field]: value,
        },
      }));
    },
    []
  );

  const toggleFeature = useCallback((feature: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredFeatures: prev.preferredFeatures.includes(feature)
        ? prev.preferredFeatures.filter((f) => f !== feature)
        : [...prev.preferredFeatures, feature],
    }));
  }, []);

  const selectBike = useCallback((bike: BikeType) => {
    setFormData((prev) => ({
      ...prev,
      bikeId: bike._id,
      bikeModel: bike.modelName,
      category: bike.category,
      priceRange: {
        min: bike.priceBreakdown.exShowroomPrice.toString(),
        max: (
          bike.priceBreakdown.onRoadPrice || bike.priceBreakdown.exShowroomPrice
        ).toString(),
      },
    }));
  }, []);

  // Validation
  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<string, string> = {};

      if (step === 1) {
        if (!formData.firstName.trim())
          newErrors.firstName = "First name is required";
        if (!formData.lastName.trim())
          newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        if (!formData.employmentType)
          newErrors.employmentType = "Employment type is required";
        if (!formData.monthlyIncome)
          newErrors.monthlyIncome = "Monthly income is required";
        if (!formData.creditScoreRange)
          newErrors.creditScoreRange = "Credit score range is required";
      }

      if (step === 2) {
        if (!formData.bikeId && !formData.bikeModel.trim()) {
          newErrors.bikeSelection = "Please select a bike or enter model name";
        }
        if (!formData.intendedUse)
          newErrors.intendedUse = "Please specify intended use";
        if (!formData.previousBikeExperience)
          newErrors.previousBikeExperience = "Please specify your experience";
      }

      if (step === 4) {
        if (!formData.termsAccepted)
          newErrors.termsAccepted = "Please accept terms and conditions";
        if (!formData.privacyPolicyAccepted)
          newErrors.privacyPolicyAccepted = "Please accept privacy policy";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  // Form submission
  const handleSubmit = useCallback(async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      const submissionData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        employmentType: formData.employmentType,
        monthlyIncome: parseFloat(formData.monthlyIncome),
        creditScoreRange: formData.creditScoreRange,
        termsAccepted: formData.termsAccepted,
        privacyPolicyAccepted: formData.privacyPolicyAccepted,

        bikeEnquiry: {
          bikeId: formData.bikeId || undefined,
          bikeModel: formData.bikeModel || undefined,
          category: formData.category || undefined,
          priceRange: formData.priceRange.min
            ? {
                min: parseFloat(formData.priceRange.min),
                max: parseFloat(formData.priceRange.max),
              }
            : undefined,
          preferredFeatures: formData.preferredFeatures,
          intendedUse: formData.intendedUse,
          previousBikeExperience: formData.previousBikeExperience,
          urgency: formData.urgency,
          additionalRequirements: formData.additionalRequirements || undefined,
          tradeInBike: formData.hasTradeIn
            ? {
                hasTradeIn: true,
                currentBikeModel: formData.currentBikeModel,
                currentBikeYear: parseInt(formData.currentBikeYear),
                estimatedValue: parseFloat(formData.estimatedValue),
                condition: formData.tradeInCondition,
              }
            : { hasTradeIn: false },
        },

        enquiryType: formData.bikeId
          ? "specific-bike"
          : formData.hasTradeIn
          ? "trade-in"
          : "general-financing",
      };

      const response = await fetch("/api/getapproved/with-bike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        if (onSubmit) onSubmit(result);
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  }, [formData, onSubmit, validateStep]);

  // Navigation
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // Success state
  if (submitted) {
    return (
      <Card className={`max-w-2xl mx-auto ${className}`}>
        <CardContent className='p-8 text-center'>
          <CheckCircle className='h-16 w-16 text-green-600 mx-auto mb-4' />
          <h2 className='text-2xl font-bold mb-2'>
            Application Submitted Successfully!
          </h2>
          <p className='text-muted-foreground mb-4'>
            Thank you for your bike financing enquiry. Our team will review your
            application and provide personalized bike recommendations within 24
            hours.
          </p>
          <Badge variant='secondary' className='mb-4'>
            Check your email for confirmation details
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      {/* Progress Indicator */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 4 ? "flex-1" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > step ? (
                  <CheckCircle className='h-4 w-4' />
                ) : (
                  step
                )}
              </div>
              {step < 4 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    currentStep > step ? "bg-red-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className='flex justify-between mt-2 text-sm text-gray-600'>
          <span>Personal Info</span>
          <span>Bike Preferences</span>
          <span>Trade-in Details</span>
          <span>Review & Submit</span>
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Personal Information"}
            {currentStep === 2 && "Bike Preferences & Requirements"}
            {currentStep === 3 && "Trade-in Information (Optional)"}
            {currentStep === 4 && "Review & Submit Application"}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className='text-red-500 text-sm'>{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className='text-red-500 text-sm'>{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className='text-red-500 text-sm'>{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input
                  id='phone'
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className='text-red-500 text-sm'>{errors.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor='employmentType'>Employment Type</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) =>
                    updateField("employmentType", value)
                  }
                >
                  <SelectTrigger
                    className={errors.employmentType ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder='Select employment type' />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employmentType && (
                  <p className='text-red-500 text-sm'>
                    {errors.employmentType}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor='monthlyIncome'>Monthly Income</Label>
                <Input
                  id='monthlyIncome'
                  type='number'
                  value={formData.monthlyIncome}
                  onChange={(e) => updateField("monthlyIncome", e.target.value)}
                  className={errors.monthlyIncome ? "border-red-500" : ""}
                />
                {errors.monthlyIncome && (
                  <p className='text-red-500 text-sm'>{errors.monthlyIncome}</p>
                )}
              </div>

              <div>
                <Label htmlFor='creditScoreRange'>Credit Score Range</Label>
                <Select
                  value={formData.creditScoreRange}
                  onValueChange={(value) =>
                    updateField("creditScoreRange", value)
                  }
                >
                  <SelectTrigger
                    className={errors.creditScoreRange ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder='Select credit score range' />
                  </SelectTrigger>
                  <SelectContent>
                    {creditScoreRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.creditScoreRange && (
                  <p className='text-red-500 text-sm'>
                    {errors.creditScoreRange}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Bike Preferences */}
          {currentStep === 2 && (
            <div className='space-y-6'>
              {/* Selected Bike Display */}
              {selectedBike && (
                <Card className='bg-blue-50 border-blue-200'>
                  <CardContent className='p-4'>
                    <div className='flex items-center space-x-4'>
                      {selectedBike.images?.[0] && (
                        <img
                          src={selectedBike.images[0].src}
                          alt={selectedBike.modelName}
                          className='w-16 h-16 object-cover rounded'
                        />
                      )}
                      <div>
                        <h3 className='font-semibold'>
                          {selectedBike.modelName}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          ₹
                          {selectedBike.priceBreakdown.exShowroomPrice?.toLocaleString()}
                        </p>
                        <Badge variant='secondary'>
                          {selectedBike.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bike Selection */}
              {!selectedBike && (
                <div>
                  <Label>Select a Bike or Enter Model</Label>
                  <div className='space-y-4 mt-2'>
                    <Input
                      placeholder='Enter bike model name (if not in list)'
                      value={formData.bikeModel}
                      onChange={(e) => updateField("bikeModel", e.target.value)}
                    />

                    {bikesLoading ? (
                      <div className='flex items-center justify-center p-8'>
                        <Loader2 className='h-8 w-8 animate-spin' />
                        <span className='ml-2'>Loading bikes...</span>
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto'>
                        {availableBikes.slice(0, 12).map((bike: BikeType) => (
                          <Card
                            key={bike._id}
                            className={`cursor-pointer transition-colors ${
                              formData.bikeId === bike._id
                                ? "border-red-500 bg-red-50"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => selectBike(bike)}
                          >
                            <CardContent className='p-3'>
                              <div className='text-sm font-medium'>
                                {bike.modelName}
                              </div>
                              <div className='text-xs text-gray-600'>
                                ₹
                                {bike.priceBreakdown.exShowroomPrice?.toLocaleString()}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.bikeSelection && (
                    <p className='text-red-500 text-sm'>
                      {errors.bikeSelection}
                    </p>
                  )}
                </div>
              )}

              {/* Category */}
              <div>
                <Label>Preferred Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateField("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Label>Price Range (₹)</Label>
                <div className='grid grid-cols-2 gap-4 mt-2'>
                  <Input
                    placeholder='Min price'
                    type='number'
                    value={formData.priceRange.min}
                    onChange={(e) =>
                      updateNestedField("priceRange", "min", e.target.value)
                    }
                  />
                  <Input
                    placeholder='Max price'
                    type='number'
                    value={formData.priceRange.max}
                    onChange={(e) =>
                      updateNestedField("priceRange", "max", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Preferred Features */}
              <div>
                <Label>Preferred Features</Label>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mt-2'>
                  {features.map((feature) => (
                    <div key={feature} className='flex items-center space-x-2'>
                      <Checkbox
                        id={feature}
                        checked={formData.preferredFeatures.includes(feature)}
                        onCheckedChange={() => toggleFeature(feature)}
                      />
                      <Label htmlFor={feature} className='text-sm'>
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intended Use */}
              <div>
                <Label>Intended Use</Label>
                <Select
                  value={formData.intendedUse}
                  onValueChange={(value) => updateField("intendedUse", value)}
                >
                  <SelectTrigger
                    className={errors.intendedUse ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder='How will you use the bike?' />
                  </SelectTrigger>
                  <SelectContent>
                    {intendedUses.map((use) => (
                      <SelectItem key={use.value} value={use.value}>
                        {use.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.intendedUse && (
                  <p className='text-red-500 text-sm'>{errors.intendedUse}</p>
                )}
              </div>

              {/* Experience Level */}
              <div>
                <Label>Riding Experience</Label>
                <Select
                  value={formData.previousBikeExperience}
                  onValueChange={(value) =>
                    updateField("previousBikeExperience", value)
                  }
                >
                  <SelectTrigger
                    className={
                      errors.previousBikeExperience ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder='Your riding experience' />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.previousBikeExperience && (
                  <p className='text-red-500 text-sm'>
                    {errors.previousBikeExperience}
                  </p>
                )}
              </div>

              {/* Urgency */}
              <div>
                <Label>Purchase Timeline</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => updateField("urgency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='When do you plan to buy?' />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Requirements */}
              <div>
                <Label>Additional Requirements</Label>
                <Textarea
                  placeholder='Any specific requirements or questions?'
                  value={formData.additionalRequirements}
                  onChange={(e) =>
                    updateField("additionalRequirements", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Trade-in Information */}
          {currentStep === 3 && (
            <div className='space-y-6'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='hasTradeIn'
                  checked={formData.hasTradeIn}
                  onCheckedChange={(checked) =>
                    updateField("hasTradeIn", !!checked)
                  }
                />
                <Label htmlFor='hasTradeIn'>I have a bike to trade-in</Label>
              </div>

              {formData.hasTradeIn ? (
                <div className='space-y-4 pl-6 border-l-2 border-blue-200'>
                  <div>
                    <Label htmlFor='currentBikeModel'>Current Bike Model</Label>
                    <Input
                      id='currentBikeModel'
                      placeholder='e.g., Honda CB Shine'
                      value={formData.currentBikeModel}
                      onChange={(e) =>
                        updateField("currentBikeModel", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor='currentBikeYear'>Year of Purchase</Label>
                    <Select
                      value={formData.currentBikeYear}
                      onValueChange={(value) =>
                        updateField("currentBikeYear", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select year' />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: 20 },
                          (_, i) => new Date().getFullYear() - i
                        ).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='estimatedValue'>Estimated Value (₹)</Label>
                    <Input
                      id='estimatedValue'
                      type='number'
                      placeholder="Your bike's estimated value"
                      value={formData.estimatedValue}
                      onChange={(e) =>
                        updateField("estimatedValue", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor='tradeInCondition'>Bike Condition</Label>
                    <Select
                      value={formData.tradeInCondition}
                      onValueChange={(value) =>
                        updateField("tradeInCondition", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select condition' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='excellent'>Excellent</SelectItem>
                        <SelectItem value='good'>Good</SelectItem>
                        <SelectItem value='fair'>Fair</SelectItem>
                        <SelectItem value='poor'>Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  <Bike className='h-12 w-12 mx-auto mb-2 opacity-50' />
                  <p>No trade-in? No problem! Continue to the next step.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className='space-y-6'>
              {/* Review Summary */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-semibold mb-4'>Application Summary</h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                  <div>
                    <strong>Personal Information:</strong>
                    <p>
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p>{formData.email}</p>
                    <p>{formData.phone}</p>
                    <p>
                      Income: ₹
                      {parseFloat(
                        formData.monthlyIncome || "0"
                      ).toLocaleString()}
                      /month
                    </p>
                  </div>

                  <div>
                    <strong>Bike Preferences:</strong>
                    {formData.bikeModel && <p>Model: {formData.bikeModel}</p>}
                    {formData.category && <p>Category: {formData.category}</p>}
                    <p>
                      Intended Use:{" "}
                      {
                        intendedUses.find(
                          (u) => u.value === formData.intendedUse
                        )?.label
                      }
                    </p>
                    <p>
                      Experience:{" "}
                      {
                        experienceLevels.find(
                          (e) => e.value === formData.previousBikeExperience
                        )?.label
                      }
                    </p>
                    <p>
                      Timeline:{" "}
                      {
                        urgencyOptions.find((u) => u.value === formData.urgency)
                          ?.label
                      }
                    </p>
                    {formData.hasTradeIn && (
                      <p>
                        Trade-in: {formData.currentBikeModel} (
                        {formData.currentBikeYear})
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='terms'
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) =>
                      updateField("termsAccepted", !!checked)
                    }
                  />
                  <Label htmlFor='terms' className='text-sm'>
                    I agree to the Terms & Conditions
                  </Label>
                </div>
                {errors.termsAccepted && (
                  <p className='text-red-500 text-sm'>{errors.termsAccepted}</p>
                )}

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='privacy'
                    checked={formData.privacyPolicyAccepted}
                    onCheckedChange={(checked) =>
                      updateField("privacyPolicyAccepted", !!checked)
                    }
                  />
                  <Label htmlFor='privacy' className='text-sm'>
                    I agree to the Privacy Policy
                  </Label>
                </div>
                {errors.privacyPolicyAccepted && (
                  <p className='text-red-500 text-sm'>
                    {errors.privacyPolicyAccepted}
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className='flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded'>
                  <AlertCircle className='h-4 w-4 text-red-600' />
                  <p className='text-red-800 text-sm'>{errors.submit}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className='flex justify-between pt-6 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                type='button'
                onClick={nextStep}
                className='bg-red-600 hover:bg-red-700'
              >
                Next <ArrowRight className='h-4 w-4 ml-2' />
              </Button>
            ) : (
              <Button
                type='button'
                onClick={handleSubmit}
                disabled={loading}
                className='bg-red-600 hover:bg-red-700'
              >
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
