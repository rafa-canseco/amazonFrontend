import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

export const useAuthenticatedAction = () => {
  const { login } = usePrivy();
  const { isLoading, authStatus, isAuthenticated } = useUser();
  const { toast } = useToast();

  const performAuthenticatedAction = async (action: () => void) => {
    if (authStatus === "loading" || isLoading) {
      toast({
        title: "Loading",
        description: "Please wait while we check your account status.",
      });
      return;
    }

    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to perform this action.",
      });
      login();
      return;
    }

    action();
  };

  return performAuthenticatedAction;
};
