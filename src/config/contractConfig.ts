export const isDev = false;

const getEnvValue = (devValue: string, prodValue: string) =>
  isDev ? devValue : prodValue;

export const CONTRACT_ADDRESS = getEnvValue(
  import.meta.env.VITE_DEV_CONTRACT_ADDRESS,
  import.meta.env.VITE_PROD_CONTRACT_ADDRESS,
) as `0x${string}`;

export const CONTRACT_CHAIN_ID = parseInt(
  getEnvValue(
    import.meta.env.VITE_DEV_CONTRACT_CHAIN_ID,
    import.meta.env.VITE_PROD_CONTRACT_CHAIN_ID,
  ) || "",
);
export const RPC_URL =
  getEnvValue(
    import.meta.env.VITE_DEV_RPC_URL,
    import.meta.env.VITE_PROD_RPC_URL,
  ) || "";
export const USDC_ADDRESS = getEnvValue(
  import.meta.env.VITE_DEV_USDC_ADDRESS,
  import.meta.env.VITE_PROD_USDC_ADDRESS,
) as `0x${string}`;
export const ADMIN_WALLET_ADDRESS =
  import.meta.env.VITE_ADMIN_WALLET_ADDRESS || "";
export const ADMIN_PRIVY_ID = import.meta.env.VITE_ADMIN_PRIVY_ID || "";
export const API_BASE_URL =
  getEnvValue(
    import.meta.env.VITE_DEV_SERVER_HOST,
    import.meta.env.VITE_PROD_SERVER_HOST,
  ) || "";
export const LANDING_HOOK = import.meta.env.VITE_MAKE_LANDING_HOOK;
export const FEEDBACK_HOOK = import.meta.env.VITE_MAKE_FEEDBACK_HOOK;

export const AAVE_POOL_ADDRESS = getEnvValue(
  import.meta.env.VITE_DEV_AAVE_POOL_ADDRESS,
  import.meta.env.VITE_PROD_AAVE_POOL_ADDRESS,
);
export const UI_POOL_DATA_PROVIDER_ADDRESS = getEnvValue(
  import.meta.env.VITE_DEV_UI_POOL_DATA_PROVIDER_ADDRESS,
  import.meta.env.VITE_PROD_UI_POOL_DATA_PROVIDER_ADDRESS,
);
export const POOL_ADDRESSES_PROVIDER = getEnvValue(
  import.meta.env.VITE_DEV_POOL_ADDRESSES_PROVIDER,
  import.meta.env.VITE_PROD_POOL_ADDRESSES_PROVIDER,
);

export const DRIFT_APP_ID = import.meta.env.VITE_DRIFT_APP_ID as string;
export const DRIFT_APP_SECRET = import.meta.env.VITE_DRIFT_APP_SECRET as string;
export const DECENT_API_KEY = import.meta.env.VITE_DECENT_API_KEY as string;
