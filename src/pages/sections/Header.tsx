import { ArrowRight } from "lucide-react";
import logo from "../../assets/isologo.png";
import LogButton from "@/componentsUX/LogButton";

const Header = () => {
  return (
    <header className="sticky top-0 left-0 right-0 z-50">
      <div className="backdrop-blur-sm h-40">
        <div className="flex justify-center items-center py-3 bg-black/8 text-white text-sm gap-3">
          <p className="text-white/60 hidden md:block ">
            {" "}
            Stop selling your crypto for fiat
          </p>
          <div className="inline-flex gap-1 items-center">
            <p>Save on shipping fees with CoinShop</p>
            <ArrowRight className="h-4 w-4 inline-flex justify-center items-center" />
          </div>
        </div>
        <div className="">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2">
              <img src={logo} alt="CoinShop" className="h-40 w-50" />

              <LogButton className="px-4 py-2 rounded-lg font-medium inline-flex align-items justify-center tracking-tight" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
