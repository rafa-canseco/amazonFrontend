"use client";
import baseSvg from "../../assets/base.svg";
import mexico from "../../assets/mexico.svg";
import usdc from "../../assets/usdc.svg";
import { motion } from "framer-motion";

export const LogoTicker = () => {
  return (
    <div className="py-8 md:py-12 bg-black">
      <div className="container">
        <div className="flex  [mask-image:linear-gradient(to_right,transparent,white,transparent)] ">
          <motion.div
            className="flex gap-14 flex-none "
            animate={{
              translateX: "100%",
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            }}
          >
            <p className="text-white mr-4">Currently available in</p>
            <img src={mexico} alt="Mexico" className="logo-ticker h-8" />
            <p className="text-white">on</p>
            <img src={baseSvg} alt="Base" className="logo-ticker h-8" />
            <p className="text-white">using</p>
            <img src={usdc} alt="USDC" className="logo-ticker h-8" />

            <p className="text-white mr-4">Currently available in</p>
            <img src={mexico} alt="Mexico" className="logo-ticker h-8" />
            <p className="text-white">on</p>
            <img src={baseSvg} alt="Base" className="logo-ticker h-8" />
            <p className="text-white">using</p>
            <img src={usdc} alt="USDC" className="logo-ticker h-8" />

            <p className="text-white mr-4">Currently available in</p>
            <img src={mexico} alt="Mexico" className="logo-ticker h-8" />
            <p className="text-white">on</p>
            <img src={baseSvg} alt="Base" className="logo-ticker h-8" />
            <p className="text-white">using</p>
            <img src={usdc} alt="USDC" className="logo-ticker h-8" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
