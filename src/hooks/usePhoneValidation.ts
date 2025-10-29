import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";

interface PhoneValidationResult {
  isValid: boolean;
  isChecking: boolean;
  exists: boolean;
  error?: string;
}

interface UsePhoneValidationProps {
  apiEndpoint: string; // Your API endpoint to check phone numbers
  debounceMs?: number;
}

export const usePhoneValidation = ({
  apiEndpoint,
  debounceMs = 500,
}: UsePhoneValidationProps) => {
  const [validationState, setValidationState] = useState<PhoneValidationResult>(
    {
      isValid: false,
      isChecking: false,
      exists: false,
    }
  );

  // Debounced function to check phone number in database
  const checkPhoneNumber = useCallback(
    debounce(async (phoneNumber: string) => {
      if (phoneNumber.length !== 10) {
        setValidationState({
          isValid: false,
          isChecking: false,
          exists: false,
          error: "Please enter a valid 10-digit phone number",
        });
        return;
      }

      setValidationState((prev) => ({
        ...prev,
        isChecking: true,
        error: undefined,
      }));

      try {
        const response = await fetch(`${apiEndpoint}/check-phone`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber: `+91${phoneNumber}` }),
        });

        const data = await response.json();

        if (response.ok) {
          setValidationState({
            isValid: data.exists,
            isChecking: false,
            exists: data.exists,
            error: data.exists
              ? undefined
              : "Phone number not found in our records",
          });
        } else {
          setValidationState({
            isValid: false,
            isChecking: false,
            exists: false,
            error: data.message || "Error checking phone number",
          });
        }
      } catch (error) {
        console.error("Phone validation error:", error);
        setValidationState({
          isValid: false,
          isChecking: false,
          exists: false,
          error: "Network error. Please try again.",
        });
      }
    }, debounceMs),
    [apiEndpoint, debounceMs]
  );

  const validatePhoneNumber = useCallback(
    (phoneNumber: string) => {
      // Reset state immediately
      setValidationState({
        isValid: false,
        isChecking: phoneNumber.length === 10,
        exists: false,
      });

      // Start validation if phone number is complete
      if (phoneNumber.length === 10) {
        checkPhoneNumber(phoneNumber);
      } else if (phoneNumber.length > 0) {
        setValidationState({
          isValid: false,
          isChecking: false,
          exists: false,
          error:
            phoneNumber.length < 10
              ? "Phone number must be 10 digits"
              : "Invalid phone number",
        });
      }
    },
    [checkPhoneNumber]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      checkPhoneNumber.cancel();
    };
  }, [checkPhoneNumber]);

  return {
    validationState,
    validatePhoneNumber,
  };
};
