import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const SuccessCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className='border-2 border-green-500'>
        <CardHeader>
          <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8 text-green-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <CardTitle className='text-2xl text-center'>
            Test Ride Scheduled!
          </CardTitle>
          <CardDescription className='text-center'>
            Your test ride request has been submitted successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center space-y-4'>
          <p>We've sent a confirmation email to details.</p>
          <p>shortly to confirm your appointment.</p>
          <div className='p-4 bg-gray-50 rounded-lg mt-4'>
            <div className='flex justify-between mb-2'>
              <span className='text-muted-foreground'>Motorcycle:</span>
            </div>
            <div className='flex justify-between mb-2'>
              <span className='text-muted-foreground'>Date:</span>
              {/* <span className="font-medium">
                {formData.date
                  ? format(formData.date, "PPP")
                  : ""}
              </span> */}
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Time:</span>
              {/* <span className="font-medium">{formData.time}</span> */}
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button
            onClick={() => (window.location.href = "/")}
            className='bg-red-600 hover:bg-red-700'
          >
            Return to Homepage
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
