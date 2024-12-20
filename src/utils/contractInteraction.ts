import AmazonOrderSystemABI from "../abi/AmazonOrderSystemABI.json";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  PublicClient,
  WalletClient,
  parseUnits,
} from "viem";
import ERC20abi from "../abi/ERC20abi.json";
import {
  CONTRACT_ADDRESS,
  RPC_URL,
  USDC_ADDRESS,
  CONTRACT_CHAIN_ID,
  isDev,
} from "../config/contractConfig";
import { base, sepolia } from "viem/chains";

const WEI_DECIMALS = 6;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function convertToWei(amount: number): bigint {
  return parseUnits(amount.toString(), WEI_DECIMALS);
}

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}
interface WalletType {
  getEthereumProvider: () => Promise<EthereumProvider>;
  chainId?: string;
}

let publicClient: PublicClient;
let walletClient: WalletClient;

const chain = isDev ? sepolia : base;

async function initializeClients(wallet?: WalletType) {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: chain,
      transport: http(RPC_URL),
    }) as any;
  }

  if (wallet && !walletClient) {
    const provider = await wallet.getEthereumProvider();
    walletClient = createWalletClient({
      chain: chain,
      transport: custom(provider),
    });
  }
}

async function checkAllowance(
  userAddress: string,
  amount: bigint,
): Promise<boolean> {
  const allowance = (await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: ERC20abi,
    functionName: "allowance",
    args: [userAddress, CONTRACT_ADDRESS],
  })) as unknown as bigint;

  return allowance >= amount;
}

export async function approveUSDCSpending(
  wallet: WalletType,
  amount: bigint,
): Promise<boolean> {
  const isCorrectNetwork = await checkNetwork(wallet);
  if (!isCorrectNetwork) {
    throw new Error(
      `Please switch to the ${isDev ? "Sepolia" : "Base"} network before proceeding.`,
    );
  }

  await initializeClients(wallet);
  const [address] = await walletClient.getAddresses();

  const isAllowanceEnough = await checkAllowance(address, amount);

  if (isAllowanceEnough) {
    return true;
  }

  const hash = await walletClient.writeContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20abi,
    functionName: "approve",
    args: [CONTRACT_ADDRESS as `0x${string}`, amount],
    account: address as `0x${string}`,
    chain: chain,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  const newAllowanceEnough = await checkAllowance(address, amount);

  return newAllowanceEnough;
}

export async function createOrderOnChain(wallet: WalletType, amount: bigint) {
  const isCorrectNetwork = await checkNetwork(wallet);
  if (!isCorrectNetwork) {
    throw new Error(
      `Please switch to the ${isDev ? "Sepolia" : "Base"} network before proceeding.`,
    );
  }

  await initializeClients(wallet);
  const [address] = await walletClient.getAddresses();

  const isApproved = await approveUSDCSpending(wallet, amount);
  if (!isApproved) {
    throw new Error("Failed to approve USDC spending");
  }

  const balance = (await publicClient.readContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20abi,
    functionName: "balanceOf",
    args: [address],
  })) as bigint;

  if (balance < amount) {
    throw new Error("Insufficient USDC balance");
  }

  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AmazonOrderSystemABI as any,
    functionName: "createOrder",
    args: [amount],
    account: address as `0x${string}`,
  });

  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  await sleep(2000);

  const events = await publicClient.getContractEvents({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AmazonOrderSystemABI,
    fromBlock: receipt.blockNumber,
    toBlock: receipt.blockNumber,
    eventName: "OrderCreated",
  });

  const orderCreatedEvent = events.find(
    (event) => event.transactionHash === hash,
  ) as any;

  if (!orderCreatedEvent) {
    throw new Error("OrderCreated event not found for the transaction");
  }

  const orderId = orderCreatedEvent.args.orderId as any;

  return { hash, orderId, receipt };
}

export async function shipOrderOnChain(wallet: WalletType, orderId: bigint) {
  await initializeClients(wallet);
  const [address] = await walletClient.getAddresses();

  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: AmazonOrderSystemABI,
    functionName: "shipOrder",
    args: [orderId],
    account: address,
  });

  const hash = await walletClient.writeContract(request);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return receipt;
}

async function checkNetwork(wallet: WalletType): Promise<boolean> {
  if (!wallet.chainId) {
    return false;
  }

  const walletChainIdNumber = parseInt(wallet.chainId.split(":")[1]);

  return walletChainIdNumber === CONTRACT_CHAIN_ID;
}
