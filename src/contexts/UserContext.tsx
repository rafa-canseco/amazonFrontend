import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { checkUserRegistration, registerUser} from '../utils/api';
import { UserData, UserContextType } from '../types/types';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, ready } = usePrivy();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const checkAndRegisterUser = async () => {
      if (!ready) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (user) {
          const walletAddress = user.wallet?.address || null;
          const isUserRegistered = await checkUserRegistration(user.id, walletAddress);

          if (!isUserRegistered) {
            const newUserData = await registerUser({
              privy_id: user.id,
              wallet_address: walletAddress,
            });
            setUserData(newUserData);
            setIsRegistered(true);
          } else {
            setUserData({ privy_id: user.id, wallet_address: walletAddress });
            setIsRegistered(true);
          }
        } else {
          setUserData(null);
          setIsRegistered(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsRegistered(false);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAndRegisterUser();
  }, [ready, user]);


  return (
    <UserContext.Provider
      value={{
        isRegistered,
        isLoading,
        error,
        userData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};