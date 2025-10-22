import {
  selectCustomer,
  selectCustomerAuth,
  selectIsAuthenticated,
} from "@/redux-store/slices/customer/customerAuthSlice";
import { useSelector } from "react-redux";

export const useAuthForCustomer = () => {
  const customer = useSelector(selectCustomer);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authState = useSelector(selectCustomerAuth);

  return {
    customer,
    isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    firebaseToken: authState.firebaseToken,
  };
};
