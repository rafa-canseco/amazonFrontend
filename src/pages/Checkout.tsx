import React from "react";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useCheckout } from "../hooks/useCheckout";
import { useUser } from "../contexts/UserContext";
import { CreateOrderRequest } from "../types/types";
import { CheckoutForm } from "./checkout/CheckoutForm";
import { OrderSummary } from "./checkout/OrderSummary";
import { AaveBorrowingInfo } from "./checkout/AaveBorrowingInfo";

export default function Checkout() {
  const { userData, authStatus } = useUser();
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

  if (authStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (authStatus === "unauthenticated" || !userData) {
    return <Navigate to="/" replace />;
  }

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
      user_id: userData.privy_id,
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
    <div className="min-h-screen flex flex-col">
      <h1 className="text-4xl sm:text-5xl font-bold text-center my-8 sm:my-12">Checkout</h1>
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="order-2 lg:order-1">
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
                showAavePaymentButton={
                  borrowCapacity !== null && borrowCapacity.maxBorrowAmount > totalUSD
                }
              />
            </div>
            <div className="order-1 lg:order-2">
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
      </div>
    </div>
  );
}