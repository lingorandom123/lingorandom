import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; 
import Homepage from "./Homepage";
import MyAccount from "./MyAccount";
import ServerCamPage from "./ServerCamPage";
import Legal from "./Legal/Legal";
import Navigation from "./Navigation";
import SignIn from './Auth/SignIn';
import CreateAccount from './Auth/CreateAccount';
import ForgotPassword from './Auth/ForgotPassword';
import { MantineProvider } from '@mantine/core';
import Footer from './Footer';
import '@mantine/core/styles.css';
import ProtectedRoute from './ProtectedRoute'; 
import RedirectIfSignedIn from './RedirectIfSignedIn'; 
import { Notifications } from '@mantine/notifications';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsSignedIn(true);
        if (user.emailVerified) {
          setIsVerified(true);
        } else {
          setIsVerified(false);
          
          // If user is signed in but NOT verified, force sign-out after 5 minutes
          setTimeout(() => {
            signOut(auth);
            navigate("/signin");
          }, 300000); // 300000 ms = 5 minutes
        }
      } else {
        setIsSignedIn(false);
        setIsVerified(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <>
      <Navigation showLinks={isSignedIn} />
      <Routes>
        <Route path="/" element={<Homepage />} />

        {/* Protected Routes - Require User to be Signed In */}
        <Route 
          path="/myaccount" 
          element={<ProtectedRoute isSignedIn={isSignedIn}><MyAccount /></ProtectedRoute>} 
        />
        
        <Route 
          path="/servercampage" 
          element={<ProtectedRoute isSignedIn={isSignedIn}><ServerCamPage /></ProtectedRoute>} 
        />

        {/* Public Routes - Redirect Signed-In Users */}
        <Route 
          path="/signin" 
          element={<RedirectIfSignedIn isSignedIn={isSignedIn} isVerified={isVerified}><SignIn /></RedirectIfSignedIn>} 
        />
        
        <Route 
          path="/createaccount" 
          element={<RedirectIfSignedIn isSignedIn={isSignedIn} isVerified={isVerified}><CreateAccount /></RedirectIfSignedIn>} 
        />
        
        <Route 
          path="/forgotpassword" 
          element={<RedirectIfSignedIn isSignedIn={isSignedIn} isVerified={isVerified}><ForgotPassword /></RedirectIfSignedIn>} 
        />

        <Route path="/legal" element={<Legal />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;