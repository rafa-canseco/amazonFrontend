export const CONTRACT_ADDRESS = import.meta.env
  .VITE_CONTRACT_ADDRESS as `0x${string}`;
export const CONTRACT_CHAIN_ID = parseInt(
  import.meta.env.VITE_CONTRACT_CHAIN_ID || "",
);
export const RPC_URL = import.meta.env.VITE_RPC_URL || "";
export const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS || "0";
export const ADMIN_WALLET_ADDRESS =
  import.meta.env.VITE_ADMIN_WALLET_ADDRESS || "";
export const ADMIN_PRIVY_ID = import.meta.env.VITE_ADMIN_PRIVY_ID || "";
export const API_BASE_URL = import.meta.env.VITE_SERVER_HOST || "";
export const LANDING_HOOK = import.meta.env.VITE_MAKE_LANDING_HOOK;
export const FEEDBACK_HOOK = import.meta.env.VITE_MAKE_FEEDBACK_HOOK;
export const MULTICALL2_ADDRESS = import.meta.env.VITE_MULTICALL2_ADDRESS;
export const AAVE_POOL_ADDRESS = import.meta.env.VITE_AAVE_POOL_ADDRESS;
export const UI_POOL_DATA_PROVIDER_ADDRESS = import.meta.env.VITE_UI_POOL_DATA_PROVIDER_ADDRESS;
export const POOL_ADDRESSES_PROVIDER = import.meta.env.VITE_POOL_ADDRESSES_PROVIDER;