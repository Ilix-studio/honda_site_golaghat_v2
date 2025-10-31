import { useState, useCallback, useEffect } from "react";
import { debounce } from "lodash";
import { useCheckPhoneNumberMutation } from "@/redux-store/services/customer/phoneValidateApi";

interface PhoneValidationState {
  isValid: boolean;
  isChecking: boolean;
  exists: boolean;
  error: string | null;
  message: string | null;
}

interface UsePhoneValidationReturn {
  phoneNumber: string;
  validationState: PhoneValidationState;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setPhoneNumber: (phone: string) => void;
  isOtpButtonDisabled: boolean;
  formatPhoneNumber: (value: string) => string;
  validatePhoneNumber: (phone: string) => Promise<void>;
}

export const usePhoneValidation = (): UsePhoneValidationReturn => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [validationState, setValidationState] = useState<PhoneValidationState>({
    isValid: false,
    isChecking: false,
    exists: false,
    error: null,
    message: null,
  });

  const [checkPhoneNumber] = useCheckPhoneNumberMutation();

  // Format phone number input
  const formatPhoneNumber = useCallback((value: string): string => {
    return value.replace(/\D/g, "").slice(0, 10);
  }, []);

  // Validate phone number format
  const isValidPhoneFormat = useCallback((phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  }, []);

  // Check if phone number exists in database using RTK Query
  const validatePhoneNumber = useCallback(
    async (phone: string): Promise<void> => {
      if (!isValidPhoneFormat(phone)) {
        setValidationState({
          isValid: false,
          isChecking: false,
          exists: false,
          error: "Please enter a valid 10-digit phone number starting with 6-9",
          message: null,
        });
        return;
      }

      setValidationState((prev) => ({
        ...prev,
        isChecking: true,
        error: null,
        message: null,
      }));

      try {
        const result = await checkPhoneNumber({ phoneNumber: phone }).unwrap();

        setValidationState({
          isValid: true,
          isChecking: false,
          exists: result.exists,
          error: null,
          message: result.exists
            ? "Phone number found"
            : "Phone number not found.",
        });
      } catch (error: any) {
        console.error("Phone validation error:", error);
        setValidationState({
          isValid: false,
          isChecking: false,
          exists: false,
          error:
            error?.data?.message ||
            "Unable to verify phone number. Please check your connection.",
          message: null,
        });
      }
    },
    [checkPhoneNumber, isValidPhoneFormat]
  );

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce((phone: string) => {
      validatePhoneNumber(phone);
    }, 800),
    [validatePhoneNumber]
  );

  // Handle phone number input change
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formattedPhone = formatPhoneNumber(e.target.value);
      setPhoneNumber(formattedPhone);

      // Reset validation state when user clears input
      if (formattedPhone.length === 0) {
        setValidationState({
          isValid: false,
          isChecking: false,
          exists: false,
          error: null,
          message: null,
        });
        debouncedValidate.cancel();
        return;
      }

      // Start validation for complete phone numbers
      if (formattedPhone.length === 10) {
        debouncedValidate(formattedPhone);
      } else {
        // Show format error for incomplete numbers
        setValidationState({
          isValid: false,
          isChecking: false,
          exists: false,
          error:
            formattedPhone.length > 0 ? "Phone number must be 10 digits" : null,
          message: null,
        });
        debouncedValidate.cancel();
      }
    },
    [formatPhoneNumber, debouncedValidate]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedValidate.cancel();
    };
  }, [debouncedValidate]);

  // Determine if OTP button should be disabled
  const isOtpButtonDisabled =
    phoneNumber.length !== 10 ||
    validationState.isChecking ||
    !validationState.exists;

  return {
    phoneNumber,
    validationState,
    handlePhoneChange,
    setPhoneNumber,
    isOtpButtonDisabled,
    formatPhoneNumber,
    validatePhoneNumber,
  };
};

export default usePhoneValidation;
