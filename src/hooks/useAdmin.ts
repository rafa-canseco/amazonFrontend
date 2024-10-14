import { useUser } from '../contexts/UserContext';

const ADMIN_WALLET_ADDRESS = '0xe1A73Ea88BDC41D98C1bC2f5325881320031F02B';
const ADMIN_PRIVY_ID = 'did:privy:cm1tw4qpp004trq2et6v9kj52';

export const useAdmin = () => {
  const { userData, isLoading } = useUser();


  if (isLoading) {
    return { isAdmin: false, isLoading: true };
  }

  if (!userData) {
    return { isAdmin: false, isLoading: false };
  }

  const isAdmin = userData.wallet_address === ADMIN_WALLET_ADDRESS || 
                  userData.privy_id === ADMIN_PRIVY_ID;


  return { isAdmin, isLoading: false };
};