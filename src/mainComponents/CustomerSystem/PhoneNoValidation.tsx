import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Phone,
  ShieldCheck,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch } from "@/hooks/redux";
import { addNotification } from "@/redux-store/slices/uiSlice";
import usePhoneValidation from "@/hooks/usePhoneValidation";

interface PhoneNumberValidationProps {
  onSendOtp: (phoneNumber: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const PhoneNumberValidation: React.FC<PhoneNumberValidationProps> = ({
  onSendOtp,
  isLoading = false,
  className = "",
}) => {
  const dispatch = useAppDispatch();
  const {
    phoneNumber,
    validationState,
    handlePhoneChange,
    isOtpButtonDisabled,
  } = usePhoneValidation();

  const handleSendOtp = async () => {
    if (!validationState.exists) {
      dispatch(
        addNotification({
          type: "error",
          message: "Phone number not found in database. Please register first.",
        })
      );
      return;
    }

    try {
      await onSendOtp(phoneNumber);
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: "Failed to send OTP. Please try again.",
        })
      );
    }
  };

  const getValidationIcon = () => {
    if (validationState.isChecking) {
      return <Loader2 className='h-4 w-4 animate-spin text-blue-500' />;
    }

    if (validationState.error) {
      return <XCircle className='h-4 w-4 text-red-500' />;
    }

    if (validationState.exists) {
      return <CheckCircle className='h-4 w-4 text-green-500' />;
    }

    if (validationState.message && !validationState.exists) {
      return <AlertCircle className='h-4 w-4 text-orange-500' />;
    }

    return null;
  };

  const getInputBorderColor = () => {
    if (phoneNumber.length === 0) return "";
    if (validationState.isChecking)
      return "border-blue-400 focus:border-blue-500";
    if (validationState.error) return "border-red-400 focus:border-red-500";
    if (validationState.exists)
      return "border-green-400 focus:border-green-500";
    if (validationState.message && !validationState.exists)
      return "border-orange-400 focus:border-orange-500";
    return "";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className='space-y-2'>
        <Label htmlFor='phone' className='text-sm font-medium text-gray-700'>
          Phone Number
        </Label>

        <div className='relative'>
          <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />

          <Input
            id='phone'
            type='tel'
            placeholder='Enter 10-digit mobile number'
            value={phoneNumber}
            onChange={handlePhoneChange}
            className={`pl-10 pr-10 h-12 text-base transition-colors ${getInputBorderColor()}`}
            disabled={isLoading}
            maxLength={10}
          />

          <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
            {getValidationIcon()}
          </div>
        </div>

        <AnimatePresence mode='wait'>
          {(validationState.error || validationState.message) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`text-sm px-3 py-2 rounded-md ${
                validationState.error
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : validationState.exists
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-orange-50 text-orange-700 border border-orange-200"
              }`}
            >
              {validationState.error || validationState.message}
            </motion.div>
          )}
        </AnimatePresence>

        {phoneNumber.length > 0 && phoneNumber.length < 10 && (
          <div className='text-xs text-gray-500 px-1'>
            {phoneNumber.length}/10 digits entered
          </div>
        )}
      </div>

      <Button
        onClick={handleSendOtp}
        disabled={isOtpButtonDisabled}
        className={`w-full h-12 font-medium transition-all duration-200 ${
          isOtpButtonDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 text-white hover:shadow-lg"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin mr-2' />
            Sending OTP...
          </>
        ) : validationState.isChecking ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin mr-2' />
            Verifying...
          </>
        ) : (
          <>
            <ShieldCheck className='h-4 w-4 mr-2' />
            Send OTP
          </>
        )}
      </Button>

      <div className='text-xs text-gray-500 text-center space-y-1'>
        <p>OTP will only be sent to registered phone numbers</p>
        {!validationState.exists &&
          phoneNumber.length === 10 &&
          !validationState.isChecking && (
            <p className='text-orange-600 font-medium'>
              Access is restricted to verified buyers
            </p>
          )}
      </div>
    </div>
  );
};

export default PhoneNumberValidation;
