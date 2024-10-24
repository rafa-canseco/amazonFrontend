import { useNavigate } from "react-router-dom";
import {
  Home,
  DoorOpen,
  CircleUserRound,
  ShoppingBag,
  MessageSquare,
  Sun,
  Moon,
  Laptop,
  ShoppingCart,
  Search
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../contexts/UserContext";
import { ModeToggle } from "../componentsUX/mode-toggle";
import CartSheet from "../componentsUX/CartSheet";
import { FeedbackSheet } from "../componentsUX/FeedbackSheet";
import { SearchBar } from "../componentsUX/SearchBar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useTheme } from "@/componentsUX/theme-provider";
import logo from "../assets/croplogo.png";

export function AppSidebar() {
  const { authenticated, logout } = usePrivy();
  const navigate = useNavigate();
  const { userData } = useUser();
  const { theme } = useTheme();

  const handleLogout = async () => {
    if (authenticated) {
      await logout();
      navigate("/");
    }
  };

  const abbreviateWallet = (wallet: string | undefined) => {
    if (!wallet) return "";
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Laptop,
  };

  const ThemeIcon = themeIcons[theme as keyof typeof themeIcons] || Sun;

  const menuItems = [
    { title: "Search", url: "#", icon: Search, component: SearchBar },
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "My Shopping Cart", url: "#", icon: ShoppingCart, component: CartSheet },
    { title: "My Orders", url: "/my-orders", icon: ShoppingBag },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="pb-0">
        <img src={logo} alt="Logo" className="w-full h-auto" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.component ? (
                    <item.component>
                      <SidebarMenuButton>
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </item.component>
                  ) : (
                    <SidebarMenuButton onClick={() => navigate(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
              {authenticated && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout}>
                    <DoorOpen className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>User</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <CircleUserRound className="mr-2 h-4 w-4" />
                  <span>{`Wallet: ${abbreviateWallet(userData?.wallet_address || "")}`}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <FeedbackSheet>
                  <SidebarMenuButton>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Got some feedback?</span>
                  </SidebarMenuButton>
                </FeedbackSheet>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <ModeToggle>
                  <SidebarMenuButton>
                    <ThemeIcon className="mr-2 h-4 w-4" />
                    <span className="capitalize">{theme} theme</span>
                  </SidebarMenuButton>
                </ModeToggle>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}