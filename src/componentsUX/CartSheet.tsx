import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {  Loader2 } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useCart, useRemoveFromCart } from "../hooks";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { CartItem } from "../types/types";
import { Separator } from "@/components/ui/separator";

interface CartSheetProps {
  children?: React.ReactNode;
}

function CartSheet({ children }: CartSheetProps) {
  const navigate = useNavigate();
  const { userData } = useUser();
  const { data: cart, isLoading } = useCart(userData?.privy_id || "");
  const removeFromCartMutation = useRemoveFromCart();
  const { data: exchangeRate, isLoading: isLoadingExchangeRate } =
    useExchangeRate();

  const { subtotalMXN, feeMXN, totalMXN, subtotalUSD, feeUSD, totalUSD } =
    useMemo(() => {
      if (!cart || !cart.items || !exchangeRate) {
        return {
          subtotalMXN: 0,
          feeMXN: 0,
          totalMXN: 0,
          subtotalUSD: 0,
          feeUSD: 0,
          totalUSD: 0,
        };
      }

      const subtotalMXN = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const feeMXN = subtotalMXN * 0.03; // 3% fee
      const totalMXN = subtotalMXN + feeMXN;

      const exchangeRateValue = exchangeRate.valor || 1;
      const subtotalUSD = subtotalMXN / exchangeRateValue;
      const feeUSD = feeMXN / exchangeRateValue;
      const totalUSD = totalMXN / exchangeRateValue;

      return {
        subtotalMXN,
        feeMXN,
        totalMXN,
        subtotalUSD,
        feeUSD,
        totalUSD,
      };
    }, [cart, exchangeRate]);

  const handleRemoveFromCart = async (asin: string) => {
    if (!userData) return;
    removeFromCartMutation.mutate({ userId: userData.privy_id, asin });
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (isLoading || isLoadingExchangeRate)
    return <Loader2 className="h-8 w-8 animate-spin" />;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="">
          {children}
          {cart && cart.items.length > 0 && (
            <Badge className="absolute -top-2 left-40" variant="destructive">
              {cart.items.length}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            Review your items and proceed to checkout
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : cart && cart.items.length > 0 ? (
          <div className="mt-6 flex flex-col space-y-4">
            {cart.items.map((item: CartItem) => (
              <div key={item.asin} className="flex items-center space-x-4">
                <div className="w-20 h-20 relative">
                  <img
                    src={item.image_url || "/placeholder.jpg"}
                    alt={item.title}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                  {item.variant_dimensions && (
                    <p className="text-sm text-muted-foreground">
                      Variant:{" "}
                      {Object.entries(item.variant_dimensions)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}
                    </p>
                  )}
                  <p className="font-bold text-lg text-green-600">
                    ${(item.price * item.quantity).toFixed(2)} MXN
                    <span className="text-sm font-normal ml-1">
                      ($
                      {(
                        (item.price * item.quantity) /
                        (exchangeRate?.valor || 1)
                      ).toFixed(2)}{" "}
                      USD)
                    </span>
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveFromCart(item.asin)}
                  disabled={removeFromCartMutation.isPending}
                >
                  {removeFromCartMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Remove"
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground mt-8">
            Your cart is empty
          </p>
        )}
        {cart && cart.items.length > 0 && (
          <SheetFooter className="mt-8">
            <div className="w-full">
              <Separator className="my-4" />
              <div className="flex flex-col space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span>
                    ${subtotalMXN.toFixed(2)} MXN (${subtotalUSD.toFixed(2)}{" "}
                    USD)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Fee (3%):</span>
                  <span>
                    ${feeMXN.toFixed(2)} MXN (${feeUSD.toFixed(2)} USD)
                  </span>
                </div>
                <div className="flex justify-between items-center font-semibold">
                  <span>Total:</span>
                  <span>
                    ${totalMXN.toFixed(2)} MXN (${totalUSD.toFixed(2)} USD)
                  </span>
                </div>
              </div>
              <Button className="w-full" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CartSheet;
