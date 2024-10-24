import { useState, useEffect } from "react";
import { getOrders } from "../utils/api";
import { Order, OrderStatus } from "../types/types";

export const useOrders = (userId: string | undefined) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      if (userId) {
        try {
          const fetchedOrders = await getOrders(userId);
          const sortedOrders = fetchedOrders.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  useEffect(() => {
    if (currentStatus === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter((order) => order.status.toLowerCase() === currentStatus),
      );
    }
  }, [currentStatus, orders]);

  const handleStatusChange = (status: OrderStatus) => {
    setCurrentStatus(status);
  };

  return {
    orders,
    filteredOrders,
    isLoading,
    currentStatus,
    handleStatusChange,
  };
};
