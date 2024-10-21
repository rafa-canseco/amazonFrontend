import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { getOrders } from "../utils/api";
import { Order } from "../types/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "./Navbar";
import {
  OrderStatusFilter,
  OrderStatus,
} from "../componentsUX/OrderStatusFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function MyOrders() {
  const { userData } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      if (userData?.privy_id) {
        try {
          const fetchedOrders = await getOrders(userData.privy_id);
          setOrders(fetchedOrders);
          setFilteredOrders(fetchedOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();
  }, [userData]);

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
      <OrderStatusFilter
        currentStatus={currentStatus}
        onStatusChange={handleStatusChange}
      />
      {filteredOrders.length === 0 ? (
        <p>No orders found for the selected status.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Order #{order.id}</CardTitle>
                <CardDescription>Status: {order.status}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div>
                    Date: {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    Total: ${order.total_amount.toFixed(2)} MXN ($
                    {order.total_amount_usd.toFixed(2)} USD)
                  </div>
                  <div>
                    Shipping Guide:{" "}
                    {order.shipping_guide || "Generating shipping order..."}
                  </div>
                </div>
                <Tabs defaultValue="items" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="items">Items</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="items">
                    <div className="mt-2">
                      <h3 className="font-semibold">Items:</h3>
                      <ul>
                        {order.items.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-4 my-2"
                          >
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div>
                              <div>{item.title}</div>
                              <div>
                                Quantity: {item.quantity}, Price: $
                                {item.price.toFixed(2)} MXN
                              </div>
                              <Button variant="link" asChild>
                                <a
                                  href={item.product_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View on Amazon
                                </a>
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="shipping">
                    <div className="mt-2">
                      <h3 className="font-semibold">Shipping Details:</h3>
                      <div>{order.full_name}</div>
                      <div>{order.street}</div>
                      <div>{order.postal_code}</div>
                      <div>Phone: {order.phone}</div>
                      {order.delivery_instructions && (
                        <div>Instructions: {order.delivery_instructions}</div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
