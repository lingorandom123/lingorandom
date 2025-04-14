import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Text, Group, Loader, Notification, InputLabel } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconX, IconCheck } from '@tabler/icons-react';
import './Auth.css';
import { Link } from "react-router-dom"; // To use React Router for navigation

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Invalid email address'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters long'),
    },
  });

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    const { email, password } = form.values;
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess('Signed in successfully!');
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No user found with that email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid credentials provided.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{padding:"20px"}}>
      <h3>Sign In</h3>
      
      <form onSubmit={handleSignIn}>
      <div style={{marginBottom:"10px"}}>
        <InputLabel>Email</InputLabel>
      <Input
          label="Email"
          placeholder="Enter your email"
          value={form.values.email}
          onChange={(e) => form.setFieldValue('email', e.target.value)}
          required
          error={form.errors.email}
        />
      </div>

        
        <div style={{marginBottom:"10px"}}>
        <InputLabel>Password</InputLabel>
        <Input
          label="Password"
          placeholder="Enter your password"
          type="password"
          value={form.values.password}
          onChange={(e) => form.setFieldValue('password', e.target.value)}
          required
          error={form.errors.password}
        />
        </div>
      
       <Button type="submit" variant="filled" color="green" loading={loading} style={{marginBottom:"10px"}}>
            {loading ? <Loader size="sm" /> : 'Sign In'}
          </Button>
       

<Group position="left" spacing="5px">


  <Link to="/forgotpassword">
              <Text size="lg" style={{textDecoration:"underline", color:"#40c057"}}>Forgot Password?</Text>
            </Link>
            <Link to="/createaccount">
              <Text size="lg" style={{textDecoration:"underline", color:"#40c057"}}>Create Account</Text>
            </Link>

</Group>
      </form>

      {/* Display Notifications with Transition */}
      <div style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000
      }}>
        {error && (
          <Notification
            icon={<IconX />}
            color="red"
            title="Error"
            mt="md"
            transition="slide-up"
            transitionDuration={500}
            autoClose={5000}
            onClose={() => setError(null)}
          >
            {error}
          </Notification>
        )}
        {success && (
          <Notification
            icon={<IconCheck />}
            color="teal"
            title="Success!"
            mt="md"
            transition="slide-up"
            transitionDuration={500}
            autoClose={5000}
            onClose={() => setSuccess(null)}
          >
            {success}
          </Notification>
        )}
      </div>
    </div>
  );
};

export default SignIn;
