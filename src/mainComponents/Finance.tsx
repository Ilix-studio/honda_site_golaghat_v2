import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Calculator,
  FileText,
  Wallet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";

// Import Redux hooks
import {
  useGetApprovedForm,
  useApplicationStatusCheck,
} from "../hooks/useGetApproved";

export function Finance() {
  // Redux form management
  const {
    form,
    errors,
    loading,
    success,
    error: submitError,
    updateField,
    handleSubmit,
    resetForm,
    clearMessages,
    validation,
  } = useGetApprovedForm();

  // Status check functionality
  const {
    loading: statusLoading,
    error: statusError,
    result: statusResult,
    checkApplicationStatus,
    clearCheck,
  } = useApplicationStatusCheck();

  // Local state for UI
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [statusEmail, setStatusEmail] = useState("");
  const [statusApplicationId, setStatusApplicationId] = useState("");

  // Clear messages when component unmounts or when switching modes
  useEffect(() => {
    return () => {
      clearMessages();
      clearCheck();
    };
  }, [clearMessages, clearCheck]);

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await handleSubmit();
      if (result) {
        // Success handled by Redux state
        console.log(
          "Application submitted successfully:",
          result.data.applicationId
        );
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
    }
  };

  // Handle status check
  const handleStatusCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await checkApplicationStatus({
        email: statusEmail,
        applicationId: statusApplicationId,
      });
    } catch (err) {
      console.error("Status check failed:", err);
    }
  };

  // Reset form and switch to application mode
  const handleStartNewApplication = () => {
    resetForm();
    clearMessages();
    setShowStatusCheck(false);
  };

  // Switch to status check mode
  const handleCheckStatus = () => {
    clearCheck();
    clearMessages();
    setShowStatusCheck(true);
  };

  return (
    <main className='min-h-screen flex flex-col'>
      <Header />

      <div className='container pt-28 pb-10 px-4 flex-grow'>
        {/* Hero Section */}
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-4xl font-bold mb-4'>
            Motorcycle Financing Made Easy
          </h1>
          <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
            Get the motorcycle of your dreams with our flexible financing
            options. Low rates, quick approvals, and personalized plans to fit
            your budget.
          </p>
        </motion.div>

        {/* Mode Toggle Buttons */}
        <div className='flex justify-center mb-8'>
          <div className='flex bg-gray-100 rounded-lg p-1'>
            <button
              onClick={handleStartNewApplication}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                !showStatusCheck
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              New Application
            </button>
            <button
              onClick={handleCheckStatus}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                showStatusCheck
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Check Status
            </button>
          </div>
        </div>

        {/* Application Form or Status Check */}
        <div className='mb-16'>
          {!showStatusCheck ? (
            // New Application Form
            <>
              <h2 className='text-2xl font-bold mb-6'>
                Get Pre-Approved Today
              </h2>

              {/* Success Message */}
              {success && (
                <Alert className='mb-6 border-green-200 bg-green-50'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <AlertDescription className='text-green-800'>
                    <strong>Application submitted successfully!</strong>
                    <br />
                    You will receive a response within 24 hours. Please check
                    your email for updates.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {submitError && (
                <Alert className='mb-6 border-red-200 bg-red-50'>
                  <AlertCircle className='h-4 w-4 text-red-600' />
                  <AlertDescription className='text-red-800'>
                    <strong>Error:</strong> {submitError}
                  </AlertDescription>
                </Alert>
              )}

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <form onSubmit={onSubmit} className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='first-name' className='mb-2 block'>
                        First Name
                      </Label>
                      <Input
                        id='first-name'
                        placeholder='Enter your first name'
                        value={form.firstName}
                        onChange={(e) =>
                          updateField("firstName", e.target.value)
                        }
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && (
                        <p className='text-red-500 text-sm mt-1'>
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='last-name' className='mb-2 block'>
                        Last Name
                      </Label>
                      <Input
                        id='last-name'
                        placeholder='Enter your last name'
                        value={form.lastName}
                        onChange={(e) =>
                          updateField("lastName", e.target.value)
                        }
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && (
                        <p className='text-red-500 text-sm mt-1'>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='email' className='mb-2 block'>
                      Email Address
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      placeholder='Enter your email address'
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor='phone' className='mb-2 block'>
                      Phone Number
                    </Label>
                    <Input
                      id='phone'
                      placeholder='Enter your phone number'
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor='employment-type' className='mb-2 block'>
                      Employment Type
                    </Label>
                    <Select
                      value={form.employmentType}
                      onValueChange={(value) =>
                        updateField("employmentType", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.employmentType ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder='Select employment type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='salaried'>Salaried</SelectItem>
                        <SelectItem value='self-employed'>
                          Self-Employed
                        </SelectItem>
                        <SelectItem value='business-owner'>
                          Business Owner
                        </SelectItem>
                        <SelectItem value='retired'>Retired</SelectItem>
                        <SelectItem value='student'>Student</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.employmentType && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.employmentType}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor='monthly-income' className='mb-2 block'>
                      Monthly Income
                    </Label>
                    <Input
                      id='monthly-income'
                      type='number'
                      placeholder='Enter your monthly income'
                      value={form.monthlyIncome}
                      onChange={(e) =>
                        updateField("monthlyIncome", e.target.value)
                      }
                      className={errors.monthlyIncome ? "border-red-500" : ""}
                    />
                    {errors.monthlyIncome && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.monthlyIncome}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor='credit-score' className='mb-2 block'>
                      Credit Score Range
                    </Label>
                    <Select
                      value={form.creditScoreRange}
                      onValueChange={(value) =>
                        updateField("creditScoreRange", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.creditScoreRange ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder='Select credit score range' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='excellent'>
                          Excellent (750+)
                        </SelectItem>
                        <SelectItem value='good'>Good (700-749)</SelectItem>
                        <SelectItem value='fair'>Fair (650-699)</SelectItem>
                        <SelectItem value='poor'>Poor (below 650)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.creditScoreRange && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.creditScoreRange}
                      </p>
                    )}
                  </div>

                  {/* Terms and Privacy Checkboxes */}
                  <div className='space-y-3'>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='terms'
                        checked={form.termsAccepted}
                        onCheckedChange={(checked) =>
                          updateField("termsAccepted", checked)
                        }
                      />
                      <Label htmlFor='terms' className='text-sm'>
                        I agree to the Terms & Conditions
                      </Label>
                    </div>
                    {errors.termsAccepted && (
                      <p className='text-red-500 text-sm'>
                        {errors.termsAccepted}
                      </p>
                    )}

                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='privacy'
                        checked={form.privacyPolicyAccepted}
                        onCheckedChange={(checked) =>
                          updateField("privacyPolicyAccepted", checked)
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

                  <Button
                    type='submit'
                    className='w-full bg-red-600 hover:bg-red-700'
                    disabled={loading || !validation.isValid}
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>

                <div className='bg-gray-50 p-6 rounded-lg'>
                  <h3 className='text-lg font-semibold mb-4'>What to Expect</h3>
                  <ul className='space-y-3 mb-6'>
                    <li className='flex items-start'>
                      <div className='h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2 mt-0.5'>
                        1
                      </div>
                      <div>
                        <strong className='block'>Submit Application</strong>
                        <span className='text-muted-foreground'>
                          Fill out the form with your details
                        </span>
                      </div>
                    </li>
                    <li className='flex items-start'>
                      <div className='h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2 mt-0.5'>
                        2
                      </div>
                      <div>
                        <strong className='block'>Quick Review</strong>
                        <span className='text-muted-foreground'>
                          Our finance team will review your application
                        </span>
                      </div>
                    </li>
                    <li className='flex items-start'>
                      <div className='h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2 mt-0.5'>
                        3
                      </div>
                      <div>
                        <strong className='block'>Get Pre-Approved</strong>
                        <span className='text-muted-foreground'>
                          Receive your pre-approval within 24 hours
                        </span>
                      </div>
                    </li>
                    <li className='flex items-start'>
                      <div className='h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2 mt-0.5'>
                        4
                      </div>
                      <div>
                        <strong className='block'>Choose Your Bike</strong>
                        <span className='text-muted-foreground'>
                          Visit our showroom to select your motorcycle
                        </span>
                      </div>
                    </li>
                  </ul>

                  <p className='text-xs text-center text-muted-foreground'>
                    Your information will be handled securely and used only for
                    processing your financing application.
                  </p>
                </div>
              </div>
            </>
          ) : (
            // Status Check Form
            <>
              <h2 className='text-2xl font-bold mb-6'>
                Check Application Status
              </h2>

              {/* Status Check Error */}
              {statusError && (
                <Alert className='mb-6 border-red-200 bg-red-50'>
                  <AlertCircle className='h-4 w-4 text-red-600' />
                  <AlertDescription className='text-red-800'>
                    <strong>Error:</strong> {statusError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Status Check Result */}
              {statusResult && (
                <Alert className='mb-6 border-green-200 bg-green-50'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <AlertDescription className='text-green-800'>
                    <div className='space-y-2'>
                      <div>
                        <strong>Application Status:</strong>{" "}
                        {statusResult.status.toUpperCase()}
                      </div>
                      <div>
                        <strong>Application ID:</strong>{" "}
                        {statusResult.applicationId}
                      </div>
                      <div>
                        <strong>Submitted:</strong>{" "}
                        {new Date(
                          statusResult.submittedAt
                        ).toLocaleDateString()}
                      </div>
                      {statusResult.preApprovalAmount && (
                        <div>
                          <strong>Pre-approved Amount:</strong> ₹
                          {statusResult.preApprovalAmount.toLocaleString()}
                        </div>
                      )}
                      {statusResult.preApprovalValidUntil && (
                        <div>
                          <strong>Valid Until:</strong>{" "}
                          {new Date(
                            statusResult.preApprovalValidUntil
                          ).toLocaleDateString()}
                        </div>
                      )}
                      {statusResult.branch && (
                        <div>
                          <strong>Branch:</strong> {statusResult.branch.name}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className='max-w-md mx-auto'>
                <form onSubmit={handleStatusCheck} className='space-y-4'>
                  <div>
                    <Label htmlFor='status-email' className='mb-2 block'>
                      Email Address
                    </Label>
                    <Input
                      id='status-email'
                      type='email'
                      placeholder='Enter your email address'
                      value={statusEmail}
                      onChange={(e) => setStatusEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor='status-application-id'
                      className='mb-2 block'
                    >
                      Application ID
                    </Label>
                    <Input
                      id='status-application-id'
                      placeholder='Enter your application ID'
                      value={statusApplicationId}
                      onChange={(e) => setStatusApplicationId(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type='submit'
                    className='w-full bg-red-600 hover:bg-red-700'
                    disabled={statusLoading}
                  >
                    {statusLoading ? "Checking..." : "Check Status"}
                  </Button>
                </form>

                <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
                  <h4 className='font-medium text-blue-900 mb-2'>Need Help?</h4>
                  <p className='text-sm text-blue-800'>
                    If you can't find your application ID, please check your
                    email for the confirmation message sent after submission, or
                    contact our customer service team.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Benefits Section */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
          <motion.div
            className='p-6 border rounded-lg shadow-sm'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className='h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
              <Calculator className='h-6 w-6 text-red-600' />
            </div>
            <h3 className='text-xl font-semibold mb-2'>Competitive Rates</h3>
            <p className='text-muted-foreground'>
              Our finance partners offer some of the best rates in the industry,
              starting from just 5.99% APR.
            </p>
          </motion.div>

          <motion.div
            className='p-6 border rounded-lg shadow-sm'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className='h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
              <FileText className='h-6 w-6 text-red-600' />
            </div>
            <h3 className='text-xl font-semibold mb-2'>Quick Approvals</h3>
            <p className='text-muted-foreground'>
              Get pre-approved in minutes with our streamlined application
              process and minimal documentation.
            </p>
          </motion.div>

          <motion.div
            className='p-6 border rounded-lg shadow-sm'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className='h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
              <Wallet className='h-6 w-6 text-red-600' />
            </div>
            <h3 className='text-xl font-semibold mb-2'>Flexible Terms</h3>
            <p className='text-muted-foreground'>
              Choose from various tenure options ranging from 12 to 84 months to
              suit your financial situation.
            </p>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className='text-2xl font-bold mb-6'>
            Frequently Asked Questions
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  What documents do I need to apply?
                </h3>
                <p className='text-muted-foreground'>
                  You'll need proof of identity (Aadhaar/PAN), address proof,
                  income proof (salary slips or IT returns), and bank statements
                  for the last 3 months.
                </p>
              </div>

              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  How long does the approval process take?
                </h3>
                <p className='text-muted-foreground'>
                  Pre-approval typically takes 24 hours, while final approval
                  can take 2-3 business days depending on documentation
                  verification.
                </p>
              </div>

              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  Can I pay off my loan early?
                </h3>
                <p className='text-muted-foreground'>
                  Yes, you can make partial or full prepayments after 6 months.
                  A nominal foreclosure charge of 2-5% may apply depending on
                  the lender.
                </p>
              </div>
            </div>

            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  What credit score do I need to qualify?
                </h3>
                <p className='text-muted-foreground'>
                  A credit score of 700+ will get you the best rates. However,
                  we work with multiple lenders who can accommodate scores as
                  low as 650.
                </p>
              </div>

              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  Is insurance included in the financing?
                </h3>
                <p className='text-muted-foreground'>
                  Yes, you can choose to include the cost of comprehensive
                  insurance in your loan amount. This helps reduce your upfront
                  costs.
                </p>
              </div>

              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  Do you offer zero down payment options?
                </h3>
                <p className='text-muted-foreground'>
                  Yes, qualified applicants with excellent credit scores can
                  avail of zero down payment options on select motorcycle
                  models.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default Finance;
