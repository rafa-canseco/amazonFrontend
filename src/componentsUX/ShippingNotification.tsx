import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getUserEmail, updateUserEmail } from "@/utils/api";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { ShippingNotificationProps } from "@/types/types";

export function ShippingNotification({
  onNotificationChange,
}: ShippingNotificationProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmail = async () => {
      if (userData?.privy_id) {
        try {
          const userEmail = await getUserEmail(userData.privy_id);
          setEmail(userEmail || "");
        } catch (error) {
          console.error("Error fetching user email:", error);
          toast({
            title: "Error",
            description: "Failed to fetch user email. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEmail();
  }, [userData, toast]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userData?.privy_id) {
      try {
        await updateUserEmail(userData.privy_id, email);
        onNotificationChange(true, email);
        toast({
          title: "Success",
          description: "Email updated successfully",
          variant: "default",
        });
      } catch (error) {
        console.error("Error updating email:", error);
        toast({
          title: "Error",
          description: "Failed to update email. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          {email ? email : "Set Email for Notifications"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Email Notification</h4>
            <p className="text-sm text-muted-foreground">
              Set or update your email to receive notifications when shipping
              guide is ready.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="col-span-2 h-8"
                required
              />
            </div>
          </div>
          <Button type="submit" size="sm">
            Save
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
