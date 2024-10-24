"use client";
import productImage from "../../assets/image.png";
import ballImage from "../../assets/ball.png";
import rockImage from "../../assets/rock.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const ProductShowCase = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const translateY = useTransform(scrollYProgress, [0, 1], [200, -200]);
  return (
    <section ref={sectionRef} className="relative pt-20 overflow-hidden">
      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="max-w-[540px] mx-auto text-center">
          <h2 className="mt-5 text-4xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-white to-[#FFFAF3] text-transparent bg-clip-text">
            From the blockchain to your doorstep
          </h2>
          <p className="mt-5 text-lg md:text-xl text-white tracking-tight leading-[30px]">
            Effortlessly spend your crypto buying whatever you want from Amazon
            with the same experience
          </p>
        </div>
        <div className="relative mt-10">
          <motion.img
            src={productImage}
            alt="Product showcase"
            className="w-full"
          />
          <motion.img
            src={rockImage}
            alt="Rock"
            className="absolute -right-1/3 -top-32 w-80 h-auto hidden md:block"
            style={{
              translateY,
            }}
          />
          <motion.img
            src={ballImage}
            alt="Ball"
            className="absolute -left-1/3 bottom-24 w-80 h-auto hidden md:block"
            style={{
              translateY,
            }}
          />
        </div>
      </div>
    </section>
  );
};
