import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageCircleQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendFeedback } from "../../utils/api";
import pinkImage from "../../assets/pink.png";
import orange from "../../assets/orange.png";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const CallToAction = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const translateY = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const [country, setCountry] = useState("");
  const [network, setNetwork] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  return (
    <section ref={sectionRef} className="relative pt-20 overflow-hidden">
      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="max-w-[540px] mx-auto text-center">
          <h2 className="mt-5 md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-white to-[#FFFAF3] text-transparent bg-clip-text">
            Help Us Grow
          </h2>
          <p className="mt-5 text-xl text-white tracking-tight leading-[30px]">
            Tell us where you'd like to see CoinShop expand next
          </p>
        </div>
        <div className="relative mt-10">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="w-64 mx-auto bg-red-600 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors duration-200 animate-pulse"
                style={{
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              >
                <MessageCircleQuestion className="mr-2" />
                Where next?
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-[#111] border-l border-[#222] text-white"
            >
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-white">
                  Where would you like to see CoinShop next?
                </SheetTitle>
              </SheetHeader>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 mt-8"
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
                  className="p-3 border rounded bg-[#222] border-[#333] text-white"
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
                  className="p-3 border rounded bg-[#222] border-[#333] text-white"
                />
                <Button
                  type="submit"
                  className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors duration-200 mt-4"
                >
                  Send
                </Button>
              </form>
            </SheetContent>
          </Sheet>
          <motion.img
            src={pinkImage}
            alt="Pink decoration"
            className="absolute -left-1/3 bottom-24 w-80 h-auto"
            style={{
              translateY,
            }}
          />
          <motion.img
            src={orange}
            alt="Rock"
            className="absolute -right-1/3 -top-32 w-80 h-auto"
            style={{
              translateY,
            }}
          />
        </div>
      </div>
    </section>
  );
};
