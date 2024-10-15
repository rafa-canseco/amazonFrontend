import { useUser } from "../contexts/UserContext";
import { ADMIN_WALLET_ADDRESS, ADMIN_PRIVY_ID } from "../config/contractConfig";

export const useAdmin = () => {
  const { userData, isLoading } = useUser();

  if (isLoading) {
    return { isAdmin: false, isLoading: true };
  }

  if (!userData) {
    return { isAdmin: false, isLoading: false };
  }

  const isAdmin =
    userData.wallet_address === ADMIN_WALLET_ADDRESS ||
    userData.privy_id === ADMIN_PRIVY_ID;

  return { isAdmin, isLoading: false };
};
