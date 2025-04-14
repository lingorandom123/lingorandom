import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import logo from './Files/wb.svg';
import { auth } from '../src/Auth/Firebase'; // Firebase authentication
import { signOut, onAuthStateChanged } from 'firebase/auth';
import './Navigation.css';
import { NativeSelect, MultiSelect, Input, Button, Text, Loader } from '@mantine/core';

function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('en'); // Default language: English
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location (route)

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => unsubscribe(); // Clean up listener
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    // You can add logic to change the language of the site dynamically based on `language`
  };

  // Check if we're on the homepage ("/") route
  const isHomepage = location.pathname === "/";

  return (
    <nav>
     

      {/* Right content section */}
      <div className="right">
        {/* Language Dropdown */}
        
        <img src={logo} width={200} height={100}/>
        {/* Conditional Rendering of About Us and FAQ Links */}
        {isHomepage && (
          <div>
            
            <Button  variant="filled" size='sm' style={{marginRight:"10px"}}
          color="green" onClick={isAuthenticated ? () => navigate('/myaccount') : () => navigate('/signin')}>
          {isAuthenticated ? 'Account' : 'Sign In'}
        </Button>
          </div>
        )}

        {/* Sign In / Account Button */}
        
      </div>
    </nav>
  );
}

export default Navigation;