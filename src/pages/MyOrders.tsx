import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { usePrivy } from "@privy-io/react-auth";
import { Loader2 } from "lucide-react";
import Navbar from "./Navbar";
import { OrdersHeader } from "@/componentsUX/OrdersHeader";
import { OrderList } from "@/componentsUX/OrderList";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useOrders } from "@/hooks/useOrders";

export default function MyOrders() {
  const { userData, isAuthenticated } = useUser();
  const { login } = usePrivy();
  const { filteredOrders, isLoading, currentStatus, handleStatusChange } =
    useOrders(userData?.privy_id);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder,
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleNotificationChange = async (
    notifyEnabled: boolean,
    email: string,
  ) => {
    setNotifyEnabled(notifyEnabled);
    setNotificationEmail(email);
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
    <div className="container mx-auto p-4 flex flex-col h-screen mt-10">
      <div className="flex-none">
        <h1 className="text-2xl font-bold mb-4 ">My Orders</h1>
        <OrdersHeader
          currentStatus={currentStatus}
          onStatusChange={handleStatusChange}
          notifyEnabled={notifyEnabled}
          notificationEmail={notificationEmail}
          onNotificationChange={handleNotificationChange}
        />
      </div>
      <div className="flex-grow overflow-auto">
        {filteredOrders.length === 0 ? (
          <p>No orders found for the selected status.</p>
        ) : (
          <OrderList orders={currentOrders} />
        )}
      </div>
      <div className="flex-none mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => paginate(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
