import { ethers } from 'ethers';
import {
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
  Pool,
  InterestRate,
} from '@aave/contract-helpers';
import * as markets from '@bgd-labs/aave-address-book';
import { formatReserves, formatUserSummary } from '@aave/math-utils';
import { CONTRACT_CHAIN_ID, RPC_URL,AAVE_POOL_ADDRESS, USDC_ADDRESS, CONTRACT_ADDRESS, MULTICALL2_ADDRESS } from "../config/contractConfig";
import dayjs from 'dayjs';
import Aave_abi from "../abi/aavePoolABI.json";
import ERC20abi from "../abi/ERC20abi.json";
import AmazonOrderSystemABI from "../abi/AmazonOrderSystemABI.json";
import MulticallABI from "../abi/Multicall.json";
import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from 'ethereum-multicall';



interface WalletType {
  getEthereumProvider: () => Promise<any>;
  chainId?: string;
}

let provider: ethers.providers.JsonRpcProvider;

async function initializeProvider() {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  }
  return provider;
}

export async function getUserBorrowingCapacity(
  wallet: WalletType,
  assetAddress: string
) {
  try {
    await initializeProvider();
    console.log("Using RPC_URL:", RPC_URL);

    const providerInstance = new ethers.providers.Web3Provider(await wallet.getEthereumProvider());
    const signer = providerInstance.getSigner();
    const userAddress = await signer.getAddress();
    console.log("User address:", userAddress);


    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress: "0x69529987FA4A075D0C00B0128fa848dc9ebbE9CE",
      provider,
      chainId: ChainId.sepolia
    });

    const incentiveDataProviderContract = new UiIncentiveDataProvider({
      uiIncentiveDataProviderAddress: "0xBA25de9a7DC623B30799F33B770d31B44c2C3b77",
      provider,
      chainId: ChainId.sepolia
    });

    console.log("Fetching reserves data...");

    const reserves = await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider: "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A",
    });
    console.log("Reserves data fetched successfully");

    const userReserves = await poolDataProviderContract.getUserReservesHumanized({
      lendingPoolAddressProvider: "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A",
      user: userAddress,
    });
    console.log("User reserves data fetched successfully");

    const reserveIncentives = await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
      lendingPoolAddressProvider: markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
    });
    console.log("Reserve incentives data fetched successfully");

    const userIncentives = await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
      lendingPoolAddressProvider: markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
      user: userAddress,
    });
    console.log("User incentives data fetched successfully");

    
    const reservesArray = reserves.reservesData;
    const baseCurrencyData = reserves.baseCurrencyData;
    const userReservesArray = userReserves.userReserves;
    
    const currentTimestamp = dayjs().unix();
    
    
    const formattedPoolReserves = formatReserves({
      reserves: reservesArray,
      currentTimestamp,
      marketReferenceCurrencyDecimals:
        baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    });


    const userSummary = formatUserSummary({
      currentTimestamp,
      marketReferencePriceInUsd: reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      marketReferenceCurrencyDecimals: reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
      userReserves: userReserves.userReserves,
      formattedReserves: formattedPoolReserves,
      userEmodeCategoryId: userReserves.userEmodeCategoryId,
    });

    const availableBorrowsUSD = parseFloat(userSummary.availableBorrowsUSD);
    const healthFactor = parseFloat(userSummary.healthFactor);
    const netWorthUSD = parseFloat(userSummary.totalLiquidityUSD) - parseFloat(userSummary.totalBorrowsUSD);
    const totalBorrowUSD = parseFloat(userSummary.totalBorrowsUSD);
    const totalCollateralUSD = parseFloat(userSummary.totalCollateralUSD);
    const assetAddress = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"
    const assetData = formattedPoolReserves.find(
      (reserve) => reserve.underlyingAsset.toLowerCase() === assetAddress.toLowerCase()
    );
    if (!assetData) throw new Error("Asset not found in Aave reserves");

    const assetPriceUSD = parseFloat(assetData.priceInUSD);
    const maxBorrowAmount = availableBorrowsUSD / assetPriceUSD;

    console.log("Max Borrow Amount:", maxBorrowAmount);
    console.log("Current Liquidation Threshold:", userSummary.currentLiquidationThreshold);
    console.log("Health Factor:", healthFactor);
    console.log("Net Worth in USD:", netWorthUSD);
    console.log("Total Borrow in USD:", totalBorrowUSD);
    console.log("Total Collateral in USD:", totalCollateralUSD);

    return {
      maxBorrowAmount,
      currentLiquidationThreshold: userSummary.currentLiquidationThreshold,
      healthFactor,
      netWorthUSD,
      totalBorrowUSD,
      totalCollateralUSD,
    };

  } catch (error) {
    console.error("Error fetching Aave data:", error);
    throw error;
  }
}
export async function borrowFromAave(
  wallet: WalletType,
  amount: number,
  assetAddress: string
) {
  try {
    await initializeProvider();
    const providerInstance = new ethers.providers.Web3Provider(
      await wallet.getEthereumProvider(),
    );
    const signer = providerInstance.getSigner();
    const userAddress = await signer.getAddress();

    const pool = new Pool(providerInstance, {
      POOL: markets.AaveV3Sepolia.POOL,
      WETH_GATEWAY: markets.AaveV3Sepolia.WETH_GATEWAY,
    });

    const txs = await pool.borrow({
      user: userAddress,
      reserve: assetAddress,
      amount: amount.toString(),
      interestRateMode: InterestRate.Variable,
      onBehalfOf: userAddress,
    });

    // Assuming there's only one transaction
    const tx = txs[0];
    const extendedTxData = await tx.tx();
    const { from, ...txData } = extendedTxData;
    
    const txResponse = await signer.sendTransaction({
      ...txData,
      value: txData.value ? ethers.BigNumber.from(txData.value) : undefined,
    });

    return txResponse;
  } catch (error) {
    console.error("Error borrowing from Aave:", error);
    throw error;
  }
}