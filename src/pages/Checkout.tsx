import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useCart } from "../hooks";
import { createOrder } from "../utils/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateOrderRequest, OrderItem, BorrowCapacity } from "../types/types";
import Navbar from "./Navbar";
import { useWallets } from "@privy-io/react-auth";
import {
  approveUSDCSpending,
  createOrderOnChain,
  convertToWei,
  payWithAave,
} from "../utils/contractInteraction";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { getUserBorrowingCapacity} from "../utils/aaveInteractions";
import { USDC_ADDRESS } from "../config/contractConfig";

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData } = useUser();
  const { data: cart, isLoading, refetch } = useCart(userData?.privy_id || "");
  const { data: exchangeRate, isLoading: isLoadingExchangeRate } =
    useExchangeRate();
  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { wallets } = useWallets();
  const [borrowCapacity, setBorrowCapacity] = useState<BorrowCapacity | null>(
    null,
  );
  const [isLoadingAave, setIsLoadingAave] = useState(false);

  const { subtotalMXN, feeMXN, totalMXN, subtotalUSD, feeUSD, totalUSD } =
    useMemo(() => {
      const subtotalMXN =
        cart?.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        ) || 0;
      const feeMXN = subtotalMXN * 0.03; // 3% fee
      const totalMXN = subtotalMXN + feeMXN;

      const exchangeRateValue = exchangeRate?.valor || 1;
      const subtotalUSD = subtotalMXN / exchangeRateValue;
      const feeUSD = feeMXN / exchangeRateValue;
      const totalUSD = totalMXN / exchangeRateValue;

      return { subtotalMXN, feeMXN, totalMXN, subtotalUSD, feeUSD, totalUSD };
    }, [cart, exchangeRate]);

  if (isLoadingExchangeRate) return <div>Loading...</div>;

  const handlePayWithAave = async () => {
    if (!userData || !wallets[0]) return;

    setIsLoadingAave(true);
    try {
      const capacity = await getUserBorrowingCapacity(wallets[0], USDC_ADDRESS);
      setBorrowCapacity(capacity as BorrowCapacity);
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

  const handleConfirmAavePayment = async () => {
    if (!userData || !wallets[0] || !borrowCapacity) return;
  
    setIsSubmitting(true);
    try {
      const wallet = wallets[0];
      const amountInUSDCUnits = convertToWei(totalUSD);
  
      await approveUSDCSpending(wallet, amountInUSDCUnits);
    
  
      // Realizar el préstamo de Aave y crear la orden en la blockchain
      const { hash, orderId } = await payWithAave(wallet, amountInUSDCUnits);
  
      toast({
        title: "Aave Payment Successful",
        description: `Successfully borrowed and created order. Transaction hash: ${hash}`,
      });
  
      // Crear la orden en el backend
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
        blockchain_order_id: orderId.toString(),
      };
  
      await createOrder(orderDetails);
  
      toast({
        title: "Order Created",
        description: `Your order #${orderId} has been created successfully.`,
      });
  
      await refetch();
      navigate("/my-orders");
    } catch (error) {
      console.error("Error in Aave payment process:", error);
      toast({
        title: "Error",
        description: "There was an error processing your Aave payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userData || !cart) return;

    setIsSubmitting(true);
    try {
      const orderItems: OrderItem[] = cart.items.map((item) => ({
        asin: item.asin,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
        image_url: item.image_url,
        variant_asin: item.variant_asin,
        variant_dimensions: item.variant_dimensions,
      }));

      const wallet = wallets[0];
      const amountInUSDCUnits = convertToWei(totalUSD);
      console.log(amountInUSDCUnits)

      try {
        const { hash: multicallHash, orderId } = await approveAndCreateOrderMulticall(
          wallet,
          amountInUSDCUnits
        );

        toast({
          description: `Order approved and created on blockchain. Order ID: ${orderId}, Transaction hash: ${multicallHash}`,
          duration: 5000,
        });
      } catch (error) {
        console.log("Error in approveAndCreateOrderMulticall:", error);
        if (
          error instanceof Error &&
          error.message.includes("switch to the Base network")
        ) {
          toast({
            title: "Wrong Network",
            description:
              "Please switch to the Base network in your wallet before proceeding.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        throw error;
      }

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
        blockchain_order_id: orderId.toString(),
      };

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
        description:
          "There was an error creating your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            placeholder="Street and Number"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            required
          />
          <Input
            placeholder="Postal Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
          <Input
            placeholder="Phone Number (with area code)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Textarea
            placeholder="Delivery Instructions (optional)"
            value={deliveryInstructions}
            onChange={(e) => setDeliveryInstructions(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Complete Order"
            )}
          </Button>
          <Button
            type="button"
            className="w-full mt-2"
            onClick={handlePayWithAave}
            disabled={isLoadingAave}
          >
            {isLoadingAave ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Aave Data...
              </>
            ) : (
              "Can I pay with Aave? 🤔"
            )}
          </Button>
          {borrowCapacity && borrowCapacity.maxBorrowAmount > totalUSD && (
            <Button
              type="button"
              className="w-full mt-2"
              onClick={handleConfirmAavePayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Aave Payment...
                </>
              ) : (
                "Ok! Pay with my credit on Aave"
              )}
            </Button>
          )}
        </form>
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cart?.items.map((item) => (
            <Card key={item.asin} className="mb-4">
              <CardContent className="flex items-center space-x-4 p-4">
                <img
                  src={item.image_url || "/placeholder.jpg"}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p>Quantity: {item.quantity}</p>
                  <p>
                    Price: ${item.price.toFixed(2)} MXN ($
                    {(item.price / (exchangeRate?.valor || 1)).toFixed(2)} USD)
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="mt-4">
            <p>
              Subtotal: ${subtotalMXN.toFixed(2)} MXN (${subtotalUSD.toFixed(2)}{" "}
              USD)
            </p>
            <p>
              Fee (3%): ${feeMXN.toFixed(2)} MXN (${feeUSD.toFixed(2)} USD)
            </p>
            <p className="font-semibold">
              Total: ${totalMXN.toFixed(2)} MXN (${totalUSD.toFixed(2)} USD)
            </p>
          </div>
          {borrowCapacity && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Aave Borrowing Capacity</h3>
                <p>
                  {"Max Borrow Amount: "}
                  {borrowCapacity.maxBorrowAmount.toFixed(2)} USDC
                </p>
                <p>
                  {"Current Liquidation Threshold: "}
                  {borrowCapacity.currentLiquidationThreshold}
                </p>
                <p>Health Factor: {borrowCapacity.healthFactor}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
