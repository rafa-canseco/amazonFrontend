import React from "react";
import { Button } from "@/components/ui/button";

export type OrderStatus = "all" | "order received" | "shipped" | "delivered";

interface OrderStatusFilterProps {
  currentStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
}

export const OrderStatusFilter: React.FC<OrderStatusFilterProps> = ({
  currentStatus,
  onStatusChange,
}) => {
  const statuses: OrderStatus[] = [
    "all",
    "order received",
    "shipped",
    "delivered",
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {statuses.map((status) => (
        <Button
          key={status}
          variant={currentStatus === status ? "default" : "outline"}
          onClick={() => onStatusChange(status)}
        >
          {status === "all"
            ? "All"
            : status.charAt(0).toUpperCase() + status.slice(1)}
        </Button>
      ))}
    </div>
  );
};
