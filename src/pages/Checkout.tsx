import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "./Navbar";
import { useCheckout } from "../hooks/useCheckout";
import { CreateOrderRequest } from "../types/types";

export default function Checkout() {
  const {
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
  } = useCheckout();

  if (isLoading || isLoadingExchangeRate) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart) return;

    const orderDetails: CreateOrderRequest = {
      user_id: "", 
      items: cart.items,
      total_amount: totalMXN,
      total_amount_usd: totalUSD,
      full_name: fullName,
      street: street,
      postal_code: postalCode,
      phone: phone,
      delivery_instructions: deliveryInstructions,
      blockchain_order_id: "", 
    };

    handleSubmit(e, orderDetails);
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={onSubmit} className="space-y-4">
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
              onClick={(e) => handleConfirmAavePayment(e)}
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
                    {(item.price / (totalMXN / totalUSD)).toFixed(2)} USD)
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