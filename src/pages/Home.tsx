import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../contexts/UserContext";
import { useExchangeRate } from "../hooks/useExchangeRate";
import Header from "./sections/Header";
import { Hero } from "./sections/Hero";
import { LogoTicker } from "./sections/LogoTicker";
import { ProductShowCase } from "./sections/ProductShowCase";
import { Comparison } from "./sections/Comparison";
import { CallToAction } from "./sections/CallToAction";
import { Footer } from "./sections/Footer";

function Home() {
  const { ready } = usePrivy();
  const { isLoading } = useUser();

  useExchangeRate();

  if (!ready || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <Hero />
      <LogoTicker />
      <ProductShowCase />
      <Comparison />
      <CallToAction />
      <Footer />
    </div>
  );
}

export default Home;
