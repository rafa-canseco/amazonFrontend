import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LogButtonProps {
  className?: string;
}

function LogButton({ className }: LogButtonProps) {
  const navigate = useNavigate();

  const handleClick = async () => {
    navigate("/dashboard");
  };

  return (
    <Button className={className} onClick={handleClick}>
      {"Launch dApp"}
    </Button>
  );
}

export default LogButton;
