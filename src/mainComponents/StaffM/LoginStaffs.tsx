import { useNavigate } from "react-router-dom";
import { useLoginStaffMutation } from "@/redux-store/services/adminApi";
import { useAuthScreen } from "@/hooks/useAuthScreen";
import RoleLoginForm from "@/mainComponents/shared/RoleLoginForm";

const LoginStaffs = () => {
  const navigate = useNavigate();
  useAuthScreen();
  const [loginStaff, { isLoading }] = useLoginStaffMutation();

  return (
    <RoleLoginForm
      brandRole='Staff Access'
      title='Staff Login'
      subtitle='Honda Dealership — Staff Portal'
      redirectPath='/staff/dashboard'
      theme='light'
      isLoading={isLoading}
      links={[
        { to: "/manager-login", label: "Sign in as Branch Admin" },
        { to: "/service-admin/login", label: "Sign in as Service Admin" },
        { to: "/part-admin/login", label: "Sign in as Parts Admin" },
        { to: "/", label: "Go to HomePage" },
      ]}
      onPasswordLogin={async (credentials) => {
        const result = await loginStaff(credentials).unwrap();
        if (result.success) navigate("/staff/dashboard", { replace: true });
      }}
    />
  );
};

export default LoginStaffs;
