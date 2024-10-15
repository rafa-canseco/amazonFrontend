import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { usePrivy } from "@privy-io/react-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authenticated, ready } = usePrivy();
  const { isRegistered, isLoading } = useUser();

  if (!ready || isLoading) {
    return <div>Loading...</div>;
  }

  if (!authenticated || !isRegistered) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
