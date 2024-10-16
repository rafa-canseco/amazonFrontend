import { useNavigate } from "react-router-dom";
import { Home, DoorOpen, CircleUserRound, ShoppingBag } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../contexts/UserContext";
import { ModeToggle } from "../componentsUX/mode-toggle";
import NavItem from "../componentsUX/NavItem";
import CartSheet from "../componentsUX/CartSheet";
import { FeedbackSheet } from "../componentsUX/FeedbackSheet";

function Navbar() {
  const { authenticated, logout } = usePrivy();
  const navigate = useNavigate();
  const { userData } = useUser();

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

  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-14 flex-col border-r bg-background hidden sm:flex">
      <nav className="flex flex-col items-center justify-between h-full py-4">
        <div className="flex flex-col items-center gap-4">
          <NavItem icon={Home} tooltip="Dashboard" to="/" />
          <CartSheet />
          <NavItem icon={ShoppingBag} tooltip="My Orders" to="/my-orders" />
          {authenticated && (
            <NavItem icon={DoorOpen} tooltip="Logout" onClick={handleLogout} />
          )}
        </div>
        <div className="flex flex-col items-center gap-4">
          <NavItem
            icon={CircleUserRound}
            tooltip={`Wallet: ${abbreviateWallet(userData?.wallet_address || "")}`}
            tooltipClassName="w-60"
          />
          <NavItem icon={FeedbackSheet} tooltip="Enviar Feedback" />
          <ModeToggle />
        </div>
      </nav>
    </aside>
  );
}

export default Navbar;
