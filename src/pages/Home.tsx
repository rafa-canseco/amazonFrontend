import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../contexts/UserContext";
import LogButton from "@/componentsUX/LogButton";

function Home() {
  const { authenticated, ready } = usePrivy();
  const { isRegistered, isLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && authenticated && isRegistered && !isLoading) {
      navigate("/dashboard");
    }
  }, [ready, authenticated, isRegistered, isLoading, navigate]);

  if (!ready || isLoading) {
    return <div>Loading...</div>;
  }

  if (authenticated && isRegistered) {
    return null; // Esto evita un flash del contenido de Home antes de la redirección
  }

  return (
    <div className="w-full flex items-center justify-center min-h-screen">
      <div className="mx-auto grid w-[350px] gap-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-40">
          CompraEnAmazonConCrypto
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-balance text-muted-foreground mb-40">
          Self explanatory
        </p>
        <LogButton className="mt-4 leading-7 [&:not(:first-child)]:mt-6" />
      </div>
    </div>
  );
}

export default Home;
