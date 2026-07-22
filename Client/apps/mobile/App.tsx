import { useEffect, useState } from "react";
import LoadingScreen from "./src/screens/splash/LoadingScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return <LoginScreen />;
}