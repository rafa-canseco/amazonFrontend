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
import { usePrivy } from "@privy-io/react-auth";

export default function MyOrders() {
  const { userData, isAuthenticated } = useUser();
  const { login } = usePrivy();
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
      } else {
        setIsLoading(false);
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

  if (!isAuthenticated()) {
    return (
      <div className="container mx-auto p-4">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
          <h1 className="text-2xl font-bold mb-4">My Orders</h1>
          <p className="text-lg mb-4">
            Please connect your wallet to view your orders.
          </p>
          <Button onClick={() => login()}>Connect Wallet</Button>
        </div>
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
        <div className="grid grid-cols-2 gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Order #{order.id}</CardTitle>
                <CardDescription>Status: {order.status}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-left">
                    Date: {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-left">
                    Total: ${order.total_amount.toFixed(2)} MXN ($
                    {order.total_amount_usd.toFixed(2)} USD)
                  </div>
                  <div className="text-left">
                    Shipping Guide:{" "}
                    {order.shipping_guide || "Generating shipping order..."}
                  </div>
                </div>
                <Tabs defaultValue="items" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 t">
                    <TabsTrigger value="items">Items</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="items">
                    <div className="mt-2">
                      <h3 className="font-semibold">Items:</h3>
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={index} className="flex my-2">
                            <div className="flex-1 text-left">
                              <div>{item.title}</div>
                              <div>
                                Quantity: {item.quantity}, Price: $
                                {item.price.toFixed(2)} MXN
                              </div>
                              <div className="mt-2">
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
                            </div>
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded ml-4"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="shipping">
                    <div className="mt-2">
                      <h3 className="font-semibold">Shipping Details:</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-left">
                          <strong>Name:</strong> {order.full_name}
                        </div>
                        <div className="text-left">
                          <strong>Street:</strong> {order.street}
                        </div>
                        <div className="text-left">
                          <strong>Postal Code:</strong> {order.postal_code}
                        </div>
                        <div className="text-left">
                          <strong>Phone:</strong> {order.phone}
                        </div>
                        {order.delivery_instructions && (
                          <div className="text-left col-span-2">
                            <strong>Instructions:</strong>{" "}
                            {order.delivery_instructions}
                          </div>
                        )}
                      </div>
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
