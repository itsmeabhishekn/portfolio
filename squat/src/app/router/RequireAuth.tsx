import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "@/components/feedback/Spinner";
import { paths } from "@/config/paths";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuth() {
  const { status } = useAuth();

  if (status === "loading") {
    return <Spinner label="Loading Squat" />;
  }

  if (status === "anonymous") {
    return <Navigate to={paths.login} replace />;
  }

  return <Outlet />;
}
