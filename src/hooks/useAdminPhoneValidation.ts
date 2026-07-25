import { useState, useCallback, useEffect } from "react";
import { debounce } from "lodash";
import { useCheckOtpPhoneMutation } from "@/redux-store/services/adminApi";

interface PhoneValidationState {
  isValid: boolean;
  isChecking: boolean;
  exists: boolean;
  error: string | null;
  message: string | null;
}

interface UseAdminPhoneValidationReturn {
  phoneNumber: string;
  validationState: PhoneValidationState;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isOtpButtonDisabled: boolean;
}

/**
 * Same phone-existence-check UX as the customer OTP flow's usePhoneValidation,
 * but checks across the 5 admin/staff role models (via /api/auth/check-phone)
 * instead of BaseCustomer — avoids burning a Firebase SMS on an unregistered
 * number, though the real rejection happens server-side in /api/auth/otp-login.
 */
export const useAdminPhoneValidation = (): UseAdminPhoneValidationReturn => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [validationState, setValidationState] = useState<PhoneValidationState>({
    isValid: false,
    isChecking: false,
    exists: false,
    error: null,
    message: null,
  });

  const [checkOtpPhone] = useCheckOtpPhoneMutation();

  const isValidPhoneFormat = useCallback((phone: string): boolean => {
    return /^[6-9]\d{9}$/.test(phone);
  }, []);

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
        const result = await checkOtpPhone({ phoneNumber: phone }).unwrap();
        setValidationState({
          isValid: true,
          isChecking: false,
          exists: result.exists,
          error: null,
          message: result.exists
            ? "Phone number found"
            : "This phone number is not registered to any account.",
        });
      } catch (error: any) {
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
    [checkOtpPhone, isValidPhoneFormat],
  );

  const debouncedValidate = useCallback(
    debounce((phone: string) => {
      validatePhoneNumber(phone);
    }, 500),
    [validatePhoneNumber],
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = e.target.value.replace(/\D/g, "").slice(0, 10);
      setPhoneNumber(formatted);

      if (formatted.length === 0) {
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

      if (formatted.length === 10) {
        debouncedValidate(formatted);
      } else {
        setValidationState({
          isValid: false,
          isChecking: false,
          exists: false,
          error: null,
          message: null,
        });
        debouncedValidate.cancel();
      }
    },
    [debouncedValidate],
  );

  useEffect(() => {
    return () => {
      debouncedValidate.cancel();
    };
  }, [debouncedValidate]);

  const isOtpButtonDisabled =
    phoneNumber.length !== 10 || validationState.isChecking || !validationState.exists;

  return {
    phoneNumber,
    validationState,
    handlePhoneChange,
    isOtpButtonDisabled,
  };
};

export default useAdminPhoneValidation;
