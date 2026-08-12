import { useNavigate } from "react-router-dom";
import { useLoginServiceAdminMutation } from "@/redux-store/services/adminApi";
import { useAuthScreen } from "@/hooks/useAuthScreen";
import RoleLoginForm from "@/mainComponents/shared/RoleLoginForm";

function LoginServiceAdmins() {
  const navigate = useNavigate();
  useAuthScreen();
  const [loginServiceAdmin, { isLoading }] = useLoginServiceAdminMutation();

  return (
    <RoleLoginForm
      brandRole='Service Admin'
      title='Service Admin Login'
      subtitle='Honda Dealership — Branch Portal'
      redirectPath='/service-admin/dashboard'
      theme='light'
      isLoading={isLoading}
      links={[
        { to: "/manager-login", label: "Sign in as Branch Admin" },
        { to: "/part-admin/login", label: "Sign in as Parts Admin" },
        { to: "/staff/login", label: "Sign in as Staff Account" },
        { to: "/", label: "Go to HomePage" },
      ]}
      onPasswordLogin={async (credentials) => {
        const result = await loginServiceAdmin(credentials).unwrap();
        if (result.success)
          navigate("/service-admin/dashboard", { replace: true });
      }}
    />
  );
}

export default LoginServiceAdmins;
