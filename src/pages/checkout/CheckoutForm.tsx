import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CheckoutFormProps {
  fullName: string;
  setFullName: (value: string) => void;
  street: string;
  setStreet: (value: string) => void;
  postalCode: string;
  setPostalCode: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  deliveryInstructions: string;
  setDeliveryInstructions: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  handlePayWithAave: () => void;
  isLoadingAave: boolean;
  handleConfirmAavePayment: (e: React.MouseEvent) => void;
  showAavePaymentButton: boolean;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
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
  onSubmit,
  handlePayWithAave,
  isLoadingAave,
  handleConfirmAavePayment,
  showAavePaymentButton,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mx-40">
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
          "Can I pay with my credit on Aave? 🤔"
        )}
      </Button>
      {showAavePaymentButton && (
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
  );
};