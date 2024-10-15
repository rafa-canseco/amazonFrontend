export const CONTRACT_ADDRESS = import.meta.env
  .VITE_CONTRACT_ADDRESS as `0x${string}`;
export const CONTRACT_CHAIN_ID = parseInt(
  import.meta.env.VITE_CONTRACT_CHAIN_ID || "11155111",
);
export const RPC_URL = import.meta.env.VITE_RPC_URL || "";
export const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS || "0";
export const ADMIN_WALLET_ADDRESS =
  import.meta.env.VITE_ADMIN_WALLET_ADDRESS || "";
export const ADMIN_PRIVY_ID = import.meta.env.VITE_ADMIN_PRIVY_ID || "";
export const API_BASE_URL = import.meta.env.VITE_SERVER_HOST || "";
