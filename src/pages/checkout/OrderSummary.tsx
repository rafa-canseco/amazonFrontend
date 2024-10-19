import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface OrderSummaryProps {
  cart: any;
  subtotalMXN: number;
  feeMXN: number;
  totalMXN: number;
  subtotalUSD: number;
  feeUSD: number;
  totalUSD: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cart,
  subtotalMXN,
  feeMXN,
  totalMXN,
  subtotalUSD,
  feeUSD,
  totalUSD,
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      {cart?.items.map((item: any) => (
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
          Subtotal: ${subtotalMXN.toFixed(2)} MXN (${subtotalUSD.toFixed(2)} USD)
        </p>
        <p>
          Fee (3%): ${feeMXN.toFixed(2)} MXN (${feeUSD.toFixed(2)} USD)
        </p>
        <p className="font-semibold">
          Total: ${totalMXN.toFixed(2)} MXN (${totalUSD.toFixed(2)} USD)
        </p>
      </div>
    </div>
  );
};