import { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { Navigate, useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { getAllOrders } from "../utils/api";
import { Order } from "../types/types";
import Navbar from "./Navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const { getAccessToken } = usePrivy();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("No access token available");
        }
        const fetchedOrders = await getAllOrders(accessToken);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAdminLoading && isAdmin) {
      fetchOrders();
    }
  }, [isAdmin, isAdminLoading, getAccessToken]);

  if (isAdminLoading) return <div>Checking admin status...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  if (isLoading) return <div>Loading orders...</div>;

  const handleRowClick = (orderId: string) => {
    navigate(`/admin/order/${orderId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Blockchain Order ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Total (MXN)</TableHead>
            <TableHead>Total (USD)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Shipping Guide</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              onClick={() => handleRowClick(order.id)}
              className="cursor-pointer hover:bg-gray-100"
            >
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.blockchain_order_id}</TableCell>
              <TableCell>{order.user_id}</TableCell>
              <TableCell>${order.total_amount}</TableCell>
              <TableCell>${order.total_amount_usd}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.shipping_guide || "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
