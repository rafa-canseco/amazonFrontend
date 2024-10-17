import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Frown,
  HandCoins,
  ArrowDownToLine,
  Clock,
  KeyRound,
  ShoppingCart,
  Store,
} from "lucide-react";

export const Comparison = () => {
  return (
    <section className="pt-20 overflow-hidden">
      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="max-w-[540px] mx-auto text-center mb-12">
          <h2 className="md:text-5xl font-bold tracking-tighter bg-gradient-to-b from-white to-[#FFFAF3] text-transparent bg-clip-text">
            Simplified Crypto Shopping
          </h2>
          <p className="mt-5 text-xl text-white tracking-tight leading-[30px]">
            See how CoinShop revolutionizes your crypto-to-shopping experience
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-between mb-12 space-y-8 md:space-y-0 md:space-x-8">
          <Card className="w-full md:w-1/2 bg-[#111] border-[#222] text-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Before</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside text-left space-y-4">
                <li className="flex items-center justify-between">
                  Transfer crypto to exchange
                  <ArrowRight className="ml-2" />
                </li>
                <li className="flex items-center justify-between">
                  Log in to exchange
                  <Frown className="ml-2" />
                </li>
                <li className="flex items-center justify-between">
                  Convert to fiat (pay fees & spread)
                  <HandCoins className="ml-2" />
                </li>
                <li className="flex items-center justify-between">
                  Withdraw to bank account
                  <ArrowDownToLine className="ml-2" />
                </li>
                <li className="flex items-center justify-between">
                  Wait for funds to clear
                  <Clock className="ml-2" />
                </li>
                <li className="flex items-center justify-between">
                  Log in to Amazon
                  <KeyRound className="ml-2" />
                </li>
                <li className="flex items-center justify-between">
                  Finally, make your purchase
                  <ShoppingCart className="ml-2" />
                </li>
              </ol>
            </CardContent>
          </Card>
          <Card className="w-full md:w-1/2 bg-[#111] border-[#222] text-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Now with CoinShop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-left flex items-center justify-between text-xl">
                Just connect your wallet and start buying!
                <Store className="ml-2" />
              </p>
              <div className="mt-8 flex justify-center">
                <svg
                  className="w-24 h-24 text-green-500"
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
      </div>
    </section>
  );
};
