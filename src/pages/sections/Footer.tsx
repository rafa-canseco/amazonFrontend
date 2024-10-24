import logo from "../../assets/croplogo.png";
import { Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="text-white text-sm flex justify-center items-center py-8">
      <div className="container flex justify-center items-center">
        <img src={logo} alt="Logo" className="h-90 w-auto" />
        <div className="flex items-center ml-4">
          Follow us:
          <a
            href="https://x.com/coinshopmx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className="ml-2" />
          </a>
        </div>
      </div>
    </footer>
  );
};
