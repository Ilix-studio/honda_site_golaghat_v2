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

import { Calculator, FileText, Wallet } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Finance() {
  const [employmentType, setEmploymentType] = useState("salaried");
  const [creditScore, setCreditScore] = useState("excellent");

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

        {/* Application Form */}
        <div className='mb-16'>
          <h2 className='text-2xl font-bold mb-6'>Get Pre-Approved Today</h2>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='first-name' className='mb-2 block'>
                    First Name
                  </Label>
                  <Input id='first-name' placeholder='Enter your first name' />
                </div>
                <div>
                  <Label htmlFor='last-name' className='mb-2 block'>
                    Last Name
                  </Label>
                  <Input id='last-name' placeholder='Enter your last name' />
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
                />
              </div>

              <div>
                <Label htmlFor='phone' className='mb-2 block'>
                  Phone Number
                </Label>
                <Input id='phone' placeholder='Enter your phone number' />
              </div>

              <div>
                <Label htmlFor='employment-type' className='mb-2 block'>
                  Employment Type
                </Label>
                <Select
                  value={employmentType}
                  onValueChange={setEmploymentType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select employment type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='salaried'>Salaried</SelectItem>
                    <SelectItem value='self-employed'>Self-Employed</SelectItem>
                    <SelectItem value='business-owner'>
                      Business Owner
                    </SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='monthly-income' className='mb-2 block'>
                  Monthly Income
                </Label>
                <Input
                  id='monthly-income'
                  placeholder='Enter your monthly income'
                />
              </div>

              <div>
                <Label htmlFor='credit-score' className='mb-2 block'>
                  Credit Score Range
                </Label>
                <Select value={creditScore} onValueChange={setCreditScore}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select credit score range' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='excellent'>Excellent (750+)</SelectItem>
                    <SelectItem value='good'>Good (700-749)</SelectItem>
                    <SelectItem value='fair'>Fair (650-699)</SelectItem>
                    <SelectItem value='poor'>Poor (below 650)</SelectItem>
                    <SelectItem value='unknown'>Don't Know</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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

              <Button className='w-full bg-red-600 hover:bg-red-700'>
                Submit Application
              </Button>

              <p className='text-xs text-center mt-4 text-muted-foreground'>
                By submitting, you agree to our Terms & Conditions and Privacy
                Policy. Your information will be handled securely.
              </p>
            </div>
          </div>
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
