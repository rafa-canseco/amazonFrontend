import AmazonOrderSystemABI from "../abi/AmazonOrderSystemABI.json";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  PublicClient,
  WalletClient,
} from "viem";
import ERC20abi from "../abi/ERC20abi.json";
import {
  CONTRACT_ADDRESS,
  RPC_URL,
  USDC_ADDRESS,
  CONTRACT_CHAIN_ID,
} from "../config/contractConfig";
import { parseUnits } from "viem";
import { base } from "viem/chains";

const WEI_DECIMALS = 6;

export function convertToWei(amount: number): bigint {
  return parseUnits(amount.toString(), WEI_DECIMALS);
}

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}
interface WalletType {
  getEthereumProvider: () => Promise<EthereumProvider>;
}

let publicClient: PublicClient;
let walletClient: WalletClient;

async function initializeClients(wallet?: WalletType) {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: base,
      transport: http(RPC_URL),
    }) as any;
  }

  if (wallet && !walletClient) {
    const provider = await wallet.getEthereumProvider();
    walletClient = createWalletClient({
      chain: base,
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
  const isCorrectNetwork = await checkNetwork(wallet);
  if (!isCorrectNetwork) {
    throw new Error("Please switch to the Base network before proceeding.");
  }

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
    chain: base,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}

export async function createOrderOnChain(wallet: WalletType, amount: bigint) {
  const isCorrectNetwork = await checkNetwork(wallet);
  if (!isCorrectNetwork) {
    throw new Error("Please switch to the Base network before proceeding.");
  }

  try {
    await initializeClients(wallet);
    const [address] = await walletClient.getAddresses();

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: AmazonOrderSystemABI as any,
      functionName: "createOrder",
      args: [amount],
      account: address,
    });

    const hash = await walletClient.writeContract(request);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

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

    return { hash, orderId };
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
  const walletChainIdNumber = parseInt(wallet.chainId.split(":")[1]);
  return walletChainIdNumber === CONTRACT_CHAIN_ID;
}
