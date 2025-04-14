import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const ProtectedRoute = ({ isSignedIn, children }) => {
  const navigate = useNavigate();
  const user = getAuth().currentUser; // Get the current user from Firebase Auth

  useEffect(() => {
    // If the user is signed in but email is not verified, redirect them to the Sign In page
    if (!isSignedIn || !user.emailVerified) {
      navigate('/signin'); // Redirect to SignIn page
    }
  }, [isSignedIn, user, navigate]);

  // If the user is signed in and email is verified, show the children
  if (isSignedIn && user && user.emailVerified) {
    return children;
  }

  return null; // Don't render anything if not signed in or not verified
};

export default ProtectedRoute;