import { useNavigate } from "react-router-dom";
import { useLoginPartAdminMutation } from "@/redux-store/services/adminApi";
import { useAuthScreen } from "@/hooks/useAuthScreen";
import RoleLoginForm from "@/mainComponents/shared/RoleLoginForm";

function LoginPartAdmin() {
  const navigate = useNavigate();
  useAuthScreen();
  const [loginPartAdmin, { isLoading }] = useLoginPartAdminMutation();

  return (
    <RoleLoginForm
      brandRole='Parts-Admin'
      title='Parts Admin Login'
      subtitle='Honda Dealership — Parts Portal'
      redirectPath='/part-admin/dashboard'
      theme='light'
      isLoading={isLoading}
      links={[
        { to: "/manager-login", label: "Sign in as Branch Admin" },
        { to: "/service-admin/login", label: "Sign in as Service Admin" },
        { to: "/staff/login", label: "Sign in as Staff Account" },
        { to: "/", label: "Go to HomePage" },
      ]}
      onPasswordLogin={async (credentials) => {
        const result = await loginPartAdmin(credentials).unwrap();
        if (result.success)
          navigate("/part-admin/dashboard", { replace: true });
      }}
    />
  );
}

export default LoginPartAdmin;
