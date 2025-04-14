import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const RedirectIfSignedIn = ({ children }) => {
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        navigate("/"); // Redirect only verified users to the homepage
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return children;
};

export default RedirectIfSignedIn;