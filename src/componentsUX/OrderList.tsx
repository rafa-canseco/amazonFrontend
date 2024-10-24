import { Order } from "../types/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface OrderListProps {
  orders: Order[];
}

export const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {orders.map((order) => (
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
  );
};
