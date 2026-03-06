import { SubmitApplicationRequest } from "@/types/getApproved.types";

export type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employmentType: SubmitApplicationRequest["employmentType"] | "";
  monthlyIncome: string;
  creditScoreRange: SubmitApplicationRequest["creditScoreRange"] | "";
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
};

export type FormErrors = Partial<Record<keyof FormData, string>>;

export const initialForm: FormData = {
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

export function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required";
  if (!form.lastName.trim()) errors.lastName = "Last name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Invalid email address";
  if (!form.phone.trim()) errors.phone = "Phone number is required";
  if (!form.employmentType)
    errors.employmentType = "Employment type is required";
  if (!form.monthlyIncome) errors.monthlyIncome = "Monthly income is required";
  else if (
    isNaN(parseFloat(form.monthlyIncome)) ||
    parseFloat(form.monthlyIncome) <= 0
  )
    errors.monthlyIncome = "Enter a valid income";
  if (!form.creditScoreRange)
    errors.creditScoreRange = "Credit score range is required";
  if (!form.termsAccepted)
    errors.termsAccepted = "You must accept the Terms & Conditions";
  if (!form.privacyPolicyAccepted)
    errors.privacyPolicyAccepted = "You must accept the Privacy Policy";
  return errors;
}
