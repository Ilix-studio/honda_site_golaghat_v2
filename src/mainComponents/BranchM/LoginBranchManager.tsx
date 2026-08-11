import { useNavigate } from "react-router-dom";
import { useLoginBranchAdminMutation } from "@/redux-store/services/adminApi";
import { useAuthScreen } from "@/hooks/useAuthScreen";
import RoleLoginForm from "@/mainComponents/shared/RoleLoginForm";

const LoginBranchManager = () => {
  const navigate = useNavigate();
  useAuthScreen();
  const [loginBranchManager, { isLoading }] = useLoginBranchAdminMutation();

  return <RoleLoginForm brandRole='Manager' title='Branch Manager Login' subtitle='Honda Dealership — Branch Portal' redirectPath='/manager/dashboard' theme='light' isLoading={isLoading} links={[{ to: '/service-admin/login', label: 'Sign in as Service Admin' }, { to: '/part-admin/login', label: 'Sign in as Parts Admin' }, { to: '/staff/login', label: 'Sign in as Staff Account' }, { to: '/', label: 'Go to HomePage' }]} onPasswordLogin={async (credentials) => { const result = await loginBranchManager(credentials).unwrap(); if (result.success) navigate('/manager/dashboard', { replace: true }); }} />;
};

export default LoginBranchManager;
