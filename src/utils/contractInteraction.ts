import AmazonOrderSystemABI from "../abi/AmazonOrderSystemABI.json";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  PublicClient,
  WalletClient,
  parseUnits,
  getContract,
} from "viem";
import ERC20abi from "../abi/ERC20abi.json";
import {
  CONTRACT_ADDRESS,
  RPC_URL,
  USDC_ADDRESS,
  CONTRACT_CHAIN_ID,
  AAVE_POOL_ADDRESS,
  MULTICALL2_ADDRESS,
} from "../config/contractConfig";
import { base ,sepolia} from "viem/chains";
import { Pool,  InterestRate } from '@aave/contract-helpers';
import MulticallABI from "../abi/Multicall.json";
import AAVE_POOL_ABI from "../abi/AavePoolABI.json";


const WEI_DECIMALS = 6;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


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

async function initializeClients(wallet?: WalletType) {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: sepolia,
      transport: http(RPC_URL),
    }) as any;
  }

  if (wallet && !walletClient) {
    const provider = await wallet.getEthereumProvider();
    walletClient = createWalletClient({
      chain: sepolia,
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

export async function approveUSDCSpending(wallet: WalletType, amount: bigint) {
  // const isCorrectNetwork = await checkNetwork(wallet);
  // if (!isCorrectNetwork) {
  //   throw new Error("Please switch to the Base network before proceeding.");
  // }

  await initializeClients(wallet);
  const [address] = await walletClient.getAddresses();

  const isAllowanceEnough = await checkAllowance(address, amount);
  if (isAllowanceEnough) {
    return null;
  }

  const hash = await walletClient.writeContract({
    address: USDC_ADDRESS,
    abi: ERC20abi,
    functionName: "approve",
    args: [CONTRACT_ADDRESS, amount],
    account: address,
    chain: sepolia,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return { hash, receipt };
}

export async function createOrderOnChain(wallet: WalletType, amount: bigint) {
  // const isCorrectNetwork = await checkNetwork(wallet);
  // if (!isCorrectNetwork) {
  //   throw new Error("Please switch to the Base network before proceeding.");
  // }

  try {
    await initializeClients(wallet);
    const [address] = await walletClient.getAddresses();
    
    const approveTx = await approveUSDCSpending(wallet, amount);
    if (approveTx) {
      console.log("USDC spending approved. Hash:", approveTx.hash);
    }

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: AmazonOrderSystemABI as any,
      functionName: "createOrder",
      args: [amount],
      account: address,
    });

    const hash = await walletClient.writeContract(request);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    await sleep(2000);

    const events = await publicClient.getContractEvents({
      address: CONTRACT_ADDRESS,
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
  } catch (error) {
    console.error("Error creating order on chain:", error);
    throw error;
  }
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
    console.error("Wallet chainId is undefined");
    return false;
  }

  const walletChainIdNumber = parseInt(wallet.chainId.split(":")[1]);

  return walletChainIdNumber === CONTRACT_CHAIN_ID;
}

