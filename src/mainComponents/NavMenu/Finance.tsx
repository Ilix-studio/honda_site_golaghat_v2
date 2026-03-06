import { useState } from "react";
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

import { Footer } from "../Home/Footer";
import { Header } from "../Home/Header/Header";

import type { SubmitApplicationRequest } from "@/types/getApproved.types";
import { useSubmitApplicationMutation } from "@/redux-store/services/customer/getApprovedApi";
import { FormData, validate } from "@/lib/financeformUtils";

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialForm: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  employmentType: "",
  monthlyIncome: "",
  creditScoreRange: "",
  termsAccepted: false,
  privacyPolicyAccepted: false,
};

export function Finance() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const [submitApplication, { isLoading, error: mutationError }] =
    useSubmitApplicationMutation();

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await submitApplication({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        employmentType:
          form.employmentType as SubmitApplicationRequest["employmentType"],
        monthlyIncome: parseFloat(form.monthlyIncome),
        creditScoreRange:
          form.creditScoreRange as SubmitApplicationRequest["creditScoreRange"],
        termsAccepted: form.termsAccepted,
        privacyPolicyAccepted: form.privacyPolicyAccepted,
      }).unwrap();

      setSuccess(true);
      setForm(initialForm);
      setErrors({});
    } catch {
      // error surfaced via mutationError
    }
  };

  const submitError =
    mutationError && "data" in mutationError
      ? (mutationError.data as { message?: string })?.message ??
        "Submission failed"
      : mutationError
      ? "Network error. Please try again."
      : null;

  const isFormValid = Object.keys(validate(form)).length === 0;

  return (
    <main className='min-h-screen flex flex-col'>
      <Header />

      <div className='container pt-28 pb-10 px-4 flex-grow'>
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

        <div className='mb-16'>
          <h2 className='text-2xl font-bold mb-6'>Get Pre-Approved Today</h2>

          {success && (
            <Alert className='mb-6 border-green-200 bg-green-50'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <AlertDescription className='text-green-800'>
                <strong>Application submitted successfully!</strong>
                <br />
                You will receive a response within 24 hours. Please check your
                email for updates.
              </AlertDescription>
            </Alert>
          )}

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
                    onChange={(e) => updateField("firstName", e.target.value)}
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
                    onChange={(e) => updateField("lastName", e.target.value)}
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
                  <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
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
                  <p className='text-red-500 text-sm mt-1'>{errors.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor='employment-type' className='mb-2 block'>
                  Employment Type
                </Label>
                <Select
                  value={form.employmentType}
                  onValueChange={(value) =>
                    updateField(
                      "employmentType",
                      value as SubmitApplicationRequest["employmentType"]
                    )
                  }
                >
                  <SelectTrigger
                    className={errors.employmentType ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder='Select employment type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='salaried'>Salaried</SelectItem>
                    <SelectItem value='self-employed'>Self-Employed</SelectItem>
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
                  onChange={(e) => updateField("monthlyIncome", e.target.value)}
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
                    updateField(
                      "creditScoreRange",
                      value as SubmitApplicationRequest["creditScoreRange"]
                    )
                  }
                >
                  <SelectTrigger
                    className={errors.creditScoreRange ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder='Select credit score range' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='excellent'>Excellent (750+)</SelectItem>
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

              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='terms'
                    checked={form.termsAccepted}
                    onCheckedChange={(checked) =>
                      updateField("termsAccepted", checked as boolean)
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
                    checked={form.privacyPolicyAccepted}
                    onCheckedChange={(checked) =>
                      updateField("privacyPolicyAccepted", checked as boolean)
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
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>

            <div className='bg-gray-50 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold mb-4'>What to Expect</h3>
              <ul className='space-y-3 mb-6'>
                {[
                  {
                    step: 1,
                    title: "Submit Application",
                    desc: "Fill out the form with your details",
                  },
                  {
                    step: 2,
                    title: "Quick Review",
                    desc: "Our finance team will review your application",
                  },
                  {
                    step: 3,
                    title: "Get Pre-Approved",
                    desc: "Receive your pre-approval within 24 hours",
                  },
                  {
                    step: 4,
                    title: "Choose Your Bike",
                    desc: "Visit our showroom to select your motorcycle",
                  },
                ].map(({ step, title, desc }) => (
                  <li key={step} className='flex items-start'>
                    <div className='h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2 mt-0.5'>
                      {step}
                    </div>
                    <div>
                      <strong className='block'>{title}</strong>
                      <span className='text-muted-foreground'>{desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className='text-xs text-center text-muted-foreground'>
                Your information will be handled securely and used only for
                processing your financing application.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
          {[
            {
              icon: Calculator,
              title: "Competitive Rates",
              desc: "Our finance partners offer some of the best rates in the industry, starting from just 5.99% APR.",
              delay: 0.1,
            },
            {
              icon: FileText,
              title: "Quick Approvals",
              desc: "Get pre-approved in minutes with our streamlined application process and minimal documentation.",
              delay: 0.2,
            },
            {
              icon: Wallet,
              title: "Flexible Terms",
              desc: "Choose from various tenure options ranging from 12 to 84 months to suit your financial situation.",
              delay: 0.3,
            },
          ].map(({ icon: Icon, title, desc, delay }) => (
            <motion.div
              key={title}
              className='p-6 border rounded-lg shadow-sm'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay }}
            >
              <div className='h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                <Icon className='h-6 w-6 text-red-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>{title}</h3>
              <p className='text-muted-foreground'>{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className='text-2xl font-bold mb-6'>
            Frequently Asked Questions
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='space-y-6'>
              {[
                {
                  q: "What documents do I need to apply?",
                  a: "You'll need proof of identity (Aadhaar/PAN), address proof, income proof (salary slips or IT returns), and bank statements for the last 3 months.",
                },
                {
                  q: "How long does the approval process take?",
                  a: "Pre-approval typically takes 24 hours, while final approval can take 2-3 business days depending on documentation verification.",
                },
                {
                  q: "Can I pay off my loan early?",
                  a: "Yes, you can make partial or full prepayments after 6 months. A nominal foreclosure charge of 2-5% may apply depending on the lender.",
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <h3 className='text-lg font-semibold mb-2'>{q}</h3>
                  <p className='text-muted-foreground'>{a}</p>
                </div>
              ))}
            </div>
            <div className='space-y-6'>
              {[
                {
                  q: "What credit score do I need to qualify?",
                  a: "A credit score of 700+ will get you the best rates. However, we work with multiple lenders who can accommodate scores as low as 650.",
                },
                {
                  q: "Is insurance included in the financing?",
                  a: "Yes, you can choose to include the cost of comprehensive insurance in your loan amount. This helps reduce your upfront costs.",
                },
                {
                  q: "Do you offer zero down payment options?",
                  a: "Yes, qualified applicants with excellent credit scores can avail of zero down payment options on select motorcycle models.",
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <h3 className='text-lg font-semibold mb-2'>{q}</h3>
                  <p className='text-muted-foreground'>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default Finance;
