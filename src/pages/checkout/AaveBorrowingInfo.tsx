import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface AaveBorrowingInfoProps {
  borrowCapacity: {
    maxBorrowAmount: number;
    currentLiquidationThreshold: string;
    healthFactor: number;
  } | null;
}

export const AaveBorrowingInfo: React.FC<AaveBorrowingInfoProps> = ({ borrowCapacity }) => {
  if (!borrowCapacity) return null;

  return (
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
        <p>Health Factor: {borrowCapacity.healthFactor.toFixed(2)}</p>
      </CardContent>
    </Card>
  );
};