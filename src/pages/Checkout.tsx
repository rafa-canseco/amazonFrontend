import React from "react";
import { Loader2 } from "lucide-react";
import Navbar from "./Navbar";
import { useCheckout } from "../hooks/useCheckout";
import { CreateOrderRequest } from "../types/types";
import { CheckoutForm } from "./checkout/CheckoutForm";
import { OrderSummary } from "./checkout/OrderSummary";
import { AaveBorrowingInfo } from "./checkout/AaveBorrowingInfo";

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
        <CheckoutForm
          fullName={fullName}
          setFullName={setFullName}
          street={street}
          setStreet={setStreet}
          postalCode={postalCode}
          setPostalCode={setPostalCode}
          phone={phone}
          setPhone={setPhone}
          deliveryInstructions={deliveryInstructions}
          setDeliveryInstructions={setDeliveryInstructions}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          handlePayWithAave={handlePayWithAave}
          isLoadingAave={isLoadingAave}
          handleConfirmAavePayment={handleConfirmAavePayment}
          showAavePaymentButton={borrowCapacity !== null && borrowCapacity.maxBorrowAmount > totalUSD}
        />
        <div>
          <OrderSummary
            cart={cart}
            subtotalMXN={subtotalMXN}
            feeMXN={feeMXN}
            totalMXN={totalMXN}
            subtotalUSD={subtotalUSD}
            feeUSD={feeUSD}
            totalUSD={totalUSD}
          />
          <AaveBorrowingInfo borrowCapacity={borrowCapacity} />
        </div>
      </div>
    </div>
  );
}