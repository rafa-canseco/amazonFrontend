import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import { ThemeProvider } from "@/componentsUX/theme-provider";
import { Toaster } from "./components/ui/toaster";
import ProductDetail from "./pages/ProductDetail";
import { UserProvider } from "./contexts/UserContext";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import AdminDashboard from "./pages/AdminDashboard";
import OrderDetails from "./pages/OrderDetails";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/product/:asin" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/order/:orderId" element={<OrderDetails />} />
            </Routes>
            <Toaster />
          </Router>
        </ThemeProvider>
      </UserProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
