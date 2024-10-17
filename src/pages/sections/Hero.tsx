"use client";
import LogButton from "@/componentsUX/LogButton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import image from "../../assets/metal.png";
import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <section className="pt-20 h-screen">
      <div className="absolute inset-0 z-0">
        <motion.img
          src={image}
          alt="Metal"
          className="w-full h-full object-cover object-top x-1/2 -translate-y-1/2"
          animate={{
            translateY: [-30, 30, -30],
          }}
          transition={{
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut",
          }}
        />
      </div>
      <div className="container max-w-6xl mx-auto relative z-10 h-min flex items-center pt-16">
        <div className="flex flex-col items-center justify-center w-full space-y-36">
          <div className="max-w-lg w-full text-center relative space-y-10">
            <div className="text-sm inline-flex border border-[#222]/10 px-3 rounded-lg tracking-tight absolute -top-16 left-1/2 transform -translate-x-1/2">
              Version 1.0 is here
            </div>
            <h1 className="md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-white to-[#FFFAF3] text-transparent bg-clip-text">
              Amazon meets crypto payments
            </h1>
            <p className="text-xl text-white tracking-tight">
              Embrace the full journey of using your crypto in a full web3
              experience with the mundo conocido
            </p>
            <div className="flex justify-center items-center space-x-4 mt-5">
              <LogButton className="btn btn-primary" />
              <Button className="btn text-white bg-transparent gap-1">
                <span>Learn More</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
