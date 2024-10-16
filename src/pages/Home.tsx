import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../contexts/UserContext";
import LogButton from "@/componentsUX/LogButton";
import mexicoSvg from "../assets/mexico.svg";
import baseSvg from "../assets/base.svg";
import {
  HandCoins,
  Clock,
  Frown,
  Store,
  MessageCircleQuestion,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getStats, sendFeedback } from "../utils/api";
import { useToast } from "@/hooks/use-toast";

function Home() {
  const { authenticated, ready } = usePrivy();
  const { isRegistered, isLoading } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_users: 0, total_order_amount: 0 });
  const [country, setCountry] = useState("");
  const [network, setNetwork] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (ready && authenticated && isRegistered && !isLoading) {
      navigate("/dashboard");
    }
  }, [ready, authenticated, isRegistered, isLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getStats();
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendFeedback(country, network);
      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate your input.",
      });
      setCountry("");
      setNetwork("");
    } catch (error) {
      console.error("Failed to send feedback:", error);
      toast({
        title: "Failed to send feedback",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!ready || isLoading) {
    return <div>Loading...</div>;
  }

  if (authenticated && isRegistered) {
    return null;
  }

  return (
    <div className="w-full flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center">
        <div className="text-3xl font-bold">CoinShop</div>
        <LogButton className="text-lg px-6 py-2 hover:bg-blue-600 transition-colors duration-200" />
      </header>
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-8">
            Crypto meets everyday shopping
          </h1>
          <h2 className="text-3xl font-bold text-gray-600 mb-12">
            adoption follows utility
          </h2>

          <div className="flex justify-between mb-12">
            <Card className="w-1/2 mr-4">
              <CardHeader>
                <CardTitle>Before</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside text-left space-y-4">
                  <li className="flex items-center justify-between">
                    Send crypto to CEX
                    <div className="flex">
                      <Frown className="ml-2" />
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    Sell crypto for fiat (pay fees and spread)
                    <HandCoins className="ml-2" />
                  </li>
                  <li className="flex items-center justify-between">
                    Wait for bank deposit
                    <Clock className="ml-2" />
                  </li>
                  <li className="flex items-center justify-between">
                    Finally shop on Amazon
                    <Store className="ml-2" />
                  </li>
                </ol>
              </CardContent>
            </Card>
            <Card className="w-1/2 ml-4">
              <CardHeader>
                <CardTitle>Now with CoinShop</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-left flex items-center justify-between">
                  Shop directly on Amazon using crypto from your wallet
                  <Store className="ml-2" />
                </p>
                <div className="mt-4 flex justify-center">
                  <svg
                    className="w-16 h-16 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mb-8 flex justify-center items-center gap-4">
            <p className="text-lg">Currently available in</p>
            <img src={mexicoSvg} alt="Mexico" className="w-12 h-12" />
            <span>on</span>
            <img src={baseSvg} alt="Base network" className="w-12 h-12" />
            <Sheet>
              <SheetTrigger asChild>
                <button className="bg-blue-500 text-white p-2 rounded flex items-center hover:bg-blue-600 transition-colors duration-200">
                  <MessageCircleQuestion className="mr-2" />
                  Where next?
                </button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>
                    Where would you like to see CoinShop next?
                  </SheetTitle>
                </SheetHeader>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4 mt-4"
                >
                  <label htmlFor="country" className="text-sm font-medium">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    placeholder="Enter a country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="p-2 border rounded"
                  />
                  <label htmlFor="network" className="text-sm font-medium">
                    Network
                  </label>
                  <input
                    id="network"
                    type="text"
                    placeholder="Enter a network"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="p-2 border rounded"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-200"
                  >
                    Send
                  </button>
                </form>
              </SheetContent>
            </Sheet>
          </div>

          <div className="mt-12 flex justify-around">
            <Card className="w-[200px]">
              <CardHeader>
                <CardTitle>{stats.total_users}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Users Registered</p>
              </CardContent>
            </Card>
            <Card className="w-[200px]">
              <CardHeader>
                <CardTitle>${stats.total_order_amount?.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Total Purchases via CoinShop</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
