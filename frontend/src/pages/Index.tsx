
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// This is just a redirect to the Dashboard page
const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
