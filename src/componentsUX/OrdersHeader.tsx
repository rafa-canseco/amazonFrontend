import { OrderStatusFilter } from "./OrderStatusFilter";
import { ShippingNotification } from "./ShippingNotification";
import { OrdersHeaderProps } from "@/types/types";

export function OrdersHeader({
  currentStatus,
  onStatusChange,
  notifyEnabled,
  notificationEmail,
  onNotificationChange,
}: OrdersHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <OrderStatusFilter
        currentStatus={currentStatus}
        onStatusChange={onStatusChange}
      />
      <ShippingNotification
        onNotificationChange={onNotificationChange}
        initialNotifyEnabled={notifyEnabled}
        initialEmail={notificationEmail}
      />
    </div>
  );
}
