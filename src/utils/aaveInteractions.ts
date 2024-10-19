import { ethers } from "ethers";
import {
  UiPoolDataProvider,
  ChainId,
  Pool,
  InterestRate,
} from "@aave/contract-helpers";
import * as markets from "@bgd-labs/aave-address-book";
import { formatReserves, formatUserSummary } from "@aave/math-utils";
import {
  RPC_URL,
  UI_POOL_DATA_PROVIDER_ADDRESS,
  POOL_ADDRESSES_PROVIDER,
} from "../config/contractConfig";
import dayjs from "dayjs";

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
  assetAddress: string,
) {
  try {
    await initializeProvider();

    const providerInstance = new ethers.providers.Web3Provider(
      await wallet.getEthereumProvider(),
    );
    const signer = providerInstance.getSigner();
    const userAddress = await signer.getAddress();

    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress: UI_POOL_DATA_PROVIDER_ADDRESS,
      provider,
      chainId: ChainId.sepolia, /// change variable
    });

    const reserves = await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider: POOL_ADDRESSES_PROVIDER,
    });

    const userReserves =
      await poolDataProviderContract.getUserReservesHumanized({
        lendingPoolAddressProvider: POOL_ADDRESSES_PROVIDER,
        user: userAddress,
      });

    const reservesArray = reserves.reservesData;
    const baseCurrencyData = reserves.baseCurrencyData;

    const currentTimestamp = dayjs().unix();

    const formattedPoolReserves = formatReserves({
      reserves: reservesArray,
      currentTimestamp,
      marketReferenceCurrencyDecimals:
        baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd:
        baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    });

    const userSummary = formatUserSummary({
      currentTimestamp,
      marketReferencePriceInUsd:
        reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      marketReferenceCurrencyDecimals:
        reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
      userReserves: userReserves.userReserves,
      formattedReserves: formattedPoolReserves,
      userEmodeCategoryId: userReserves.userEmodeCategoryId,
    });

    const availableBorrowsUSD = parseFloat(userSummary.availableBorrowsUSD);
    const healthFactor = parseFloat(userSummary.healthFactor);
    const netWorthUSD =
      parseFloat(userSummary.totalLiquidityUSD) -
      parseFloat(userSummary.totalBorrowsUSD);
    const totalBorrowUSD = parseFloat(userSummary.totalBorrowsUSD);
    const totalCollateralUSD = parseFloat(userSummary.totalCollateralUSD);
    const assetData = formattedPoolReserves.find(
      (reserve) =>
        reserve.underlyingAsset.toLowerCase() === assetAddress.toLowerCase(),
    );
    if (!assetData) throw new Error("Asset not found in Aave reserves");

    const assetPriceUSD = parseFloat(assetData.priceInUSD);
    const maxBorrowAmount = availableBorrowsUSD / assetPriceUSD;

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
  assetAddress: string,
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

    const tx = txs[0];
    const extendedTxData = await tx.tx();
    const { ...txData } = extendedTxData;

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
