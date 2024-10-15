import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { getOrders } from "../utils/api";
import { Order } from "../types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "./Navbar";

export default function MyOrders() {
  const { userData } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (userData?.privy_id) {
        try {
          const fetchedOrders = await getOrders(userData.privy_id);
          setOrders(fetchedOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();
  }, [userData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Order #{order.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Status: {order.status}</p>
                <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                <p>
                  Total: ${order.total_amount.toFixed(2)} MXN ($
                  {order.total_amount_usd.toFixed(2)} USD)
                </p>
                <p>
                  Shipping Guide:{" "}
                  {order.shipping_guide || "Generating shipping order..."}
                </p>
                <div className="mt-2">
                  <h3 className="font-semibold">Items:</h3>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.title} - Quantity: {item.quantity}, Price: $
                        {item.price.toFixed(2)} MXN
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <h3 className="font-semibold">Shipping Details:</h3>
                  <p>{order.full_name}</p>
                  <p>{order.street}</p>
                  <p>{order.postal_code}</p>
                  <p>Phone: {order.phone}</p>
                  {order.delivery_instructions && (
                    <p>Instructions: {order.delivery_instructions}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
