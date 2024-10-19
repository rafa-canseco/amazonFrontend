import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useCart } from "../hooks";
import { createOrder } from "../utils/api";
import { useToast } from "@/hooks/use-toast";
import { CreateOrderRequest, OrderItem, BorrowCapacity } from "../types/types";
import { useWallets } from "@privy-io/react-auth";
import {
  convertToWei,
  createOrderOnChain,
} from "../utils/contractInteraction";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { getUserBorrowingCapacity, borrowFromAave } from "../utils/aaveInteractions";
import { USDC_ADDRESS } from "../config/contractConfig";

export function useCheckout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData } = useUser();
  const { data: cart, isLoading, refetch } = useCart(userData?.privy_id || "");
  const { data: exchangeRate, isLoading: isLoadingExchangeRate } = useExchangeRate();
  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { wallets } = useWallets();
  const [borrowCapacity, setBorrowCapacity] = useState<BorrowCapacity | null>(null);
  const [isLoadingAave, setIsLoadingAave] = useState(false);

  const { subtotalMXN, feeMXN, totalMXN, subtotalUSD, feeUSD, totalUSD } =
      useMemo(() => {
        const subtotalMXN =
          cart?.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ) || 0;
        const feeMXN = subtotalMXN * 0.03;
        const totalMXN = subtotalMXN + feeMXN;
  
        const exchangeRateValue = exchangeRate?.valor || 1;
        const subtotalUSD = subtotalMXN / exchangeRateValue;
        const feeUSD = feeMXN / exchangeRateValue;
        const totalUSD = totalMXN / exchangeRateValue;
  
        return { subtotalMXN, feeMXN, totalMXN, subtotalUSD, feeUSD, totalUSD };
      }, [cart, exchangeRate]);

  const handlePayWithAave = async () => {
    if (!userData || !wallets[0]) return;

    setIsLoadingAave(true);
    try {
      const capacity = await getUserBorrowingCapacity(wallets[0], USDC_ADDRESS);
      setBorrowCapacity(capacity as unknown as BorrowCapacity);
      toast({
        title: "Aave Borrowing Capacity",
        description: `Max borrow amount: ${capacity.maxBorrowAmount.toFixed(2)} USDC`,
      });
    } catch (error) {
      console.error("Error fetching Aave borrowing capacity:", error);
      let errorMessage = "Unable to fetch Aave borrowing capacity. ";
      if (error instanceof Error) {
        errorMessage += error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingAave(false);
    }
  };

  const handleConfirmAavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !wallets[0] || !borrowCapacity || !cart) return;
  
    if (!fullName || !street || !postalCode || !phone) {
      toast({
        title: "Form Incomplete",
        description: "Please fill out all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }
  
    setIsSubmitting(true);
    try {
      const wallet = wallets[0];
  
      const borrowTx = await borrowFromAave(wallet, totalUSD, USDC_ADDRESS);
      await borrowTx.wait();
      toast({
        title: "Aave Borrowing Successful",
        description: `Successfully borrowed ${totalUSD} USDC from Aave. Transaction hash: ${borrowTx.hash}`,
      });
  
      const orderItems: OrderItem[] = cart.items.map((item) => ({
        asin: item.asin,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
        image_url: item.image_url,
        variant_asin: item.variant_asin,
        variant_dimensions: item.variant_dimensions,
      }));
  
      const orderDetails: CreateOrderRequest = {
        user_id: userData.privy_id,
        items: orderItems,
        total_amount: totalMXN,
        total_amount_usd: totalUSD,
        full_name: fullName,
        street: street,
        postal_code: postalCode,
        phone: phone,
        delivery_instructions: deliveryInstructions,
        blockchain_order_id: "",
      };
  
      await handleSubmit(e, orderDetails);
    } catch (error) {
      console.error("Error in Aave payment process:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error processing your Aave payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, orderDetails: CreateOrderRequest) => {
    e.preventDefault();
    if (!userData || !cart || !wallets[0]) return;
  
    setIsSubmitting(true);
    try {
      const wallet = wallets[0];
      const amountInUSDCUnits = convertToWei(orderDetails.total_amount_usd);
  
      const { hash, orderId } = await createOrderOnChain(wallet, amountInUSDCUnits);
    
    toast({
      description: `Order created on blockchain. Order ID: ${orderId}, Transaction hash: ${hash}`,
      duration: 5000,
    });
  
  
      orderDetails.blockchain_order_id = orderId.toString();
  
      await createOrder(orderDetails);
  
      toast({
        title: "Order Created",
        description: `Your order #${orderId} has been created successfully.`,
      });
  
      await refetch();
      navigate("/my-orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error creating your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    fullName,
    setFullName,
    street,
    setStreet,
    postalCode,
    setPostalCode,
    phone,
    setPhone,
    deliveryInstructions,
    setDeliveryInstructions,
    isSubmitting,
    borrowCapacity,
    isLoadingAave,
    cart,
    isLoading,
    isLoadingExchangeRate,
    subtotalMXN,
    feeMXN,
    totalMXN,
    subtotalUSD,
    feeUSD,
    totalUSD,
    handlePayWithAave,
    handleConfirmAavePayment,
    handleSubmit,
  };
}