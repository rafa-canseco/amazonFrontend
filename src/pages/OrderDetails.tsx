import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { getOrderDetails, updateOrderStatus } from "../utils/api";
import { Order, OrderItem } from "../types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
// import { shipOrderOnChain } from "../utils/contractInteraction";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { useWallets } from "@privy-io/react-auth";

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const { getAccessToken } = usePrivy();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingGuide, setShippingGuide] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  // const { wallets } = useWallets();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("No access token available");
        }
        const fetchedOrder = await getOrderDetails(accessToken, orderId!);
        setOrder(fetchedOrder);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch order details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, getAccessToken, toast]);

  const handleUpdateStatus = async () => {
    if (!order || !shippingGuide) {
      toast({
        title: "Error",
        description: "Please enter a shipping guide number.",
        variant: "destructive",
      });
      return;
    }

    try {
      // const wallet = wallets[0];
      // await shipOrderOnChain(wallet, BigInt(order.blockchain_order_id));

      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No access token available");

      await updateOrderStatus(accessToken, order.id, "shipped", shippingGuide);

      setOrder({ ...order, status: "shipped" });

      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading order details...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <Table>
        <TableCaption>Order Information</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Detail</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <strong>Order ID:</strong>
            </TableCell>
            <TableCell>{order.id}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <strong>Blockchain Order ID:</strong>
            </TableCell>
            <TableCell>{order.blockchain_order_id}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <strong>User ID:</strong>
            </TableCell>
            <TableCell>{order.user_id}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <strong>Total (MXN):</strong>
            </TableCell>
            <TableCell>${order.total_amount}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <strong>Total (USD):</strong>
            </TableCell>
            <TableCell>${order.total_amount_usd}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <strong>Status:</strong>
            </TableCell>
            <TableCell>{order.status}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <strong>Created At:</strong>
            </TableCell>
            <TableCell>{order.created_at}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <strong>Full Name:</strong>
            </TableCell>
            <TableCell>{order.full_name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <strong>Street:</strong>
            </TableCell>
            <TableCell>{order.street}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <strong>Postal Code:</strong>
            </TableCell>
            <TableCell>{order.postal_code}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <strong>Phone:</strong>
            </TableCell>
            <TableCell>{order.phone}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <strong>Delivery Instructions:</strong>
            </TableCell>
            <TableCell>{order.delivery_instructions}</TableCell>
          </TableRow>
          {order.shipping_guide && (
            <TableRow>
              <TableCell>
                <strong>Shipping Guide:</strong>
              </TableCell>
              <TableCell>{order.shipping_guide}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Items</h2>
        <Table>
          <TableCaption>The items in the order.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ASIN</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Image</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items && order.items.length > 0 ? (
              order.items.map((item: OrderItem, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.asin}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.price}</TableCell>
                  <TableCell>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-16 h-16 object-cover"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  No items found for this order.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Input
          value={shippingGuide}
          onChange={(e) => setShippingGuide(e.target.value)}
          placeholder="Enter shipping guide"
          className="mb-2"
        />
        <Button onClick={handleUpdateStatus} disabled={!shippingGuide}>
          Update Status to Shipped
        </Button>
      </div>
      <Button onClick={() => navigate("/admin")} className="mt-4">
        Back to Dashboard
      </Button>
    </div>
  );
}
