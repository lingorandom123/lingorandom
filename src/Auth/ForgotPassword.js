import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Text, Notification, Loader, Group } from '@mantine/core'; // Import Mantine components
import { useForm } from '@mantine/form';
import { IconX, IconCheck } from '@tabler/icons-react'; // Icons for notifications
import { Link } from "react-router-dom"; // To use React Router for navigation

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Using Mantine form hook for better validation and state management
  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Invalid email address'),
    },
  });

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const { email } = form.values;

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
      setError('');
    } catch (error) {
      setError('Failed to send reset email. Please try again later.');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <h3>Forgot Password</h3>

      <form onSubmit={handleResetPassword}>
        {/* Email */}
        <div>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={form.values.email}
            onChange={(e) => form.setFieldValue('email', e.target.value)}
            required
            error={form.errors.email}
          />
        </div>

        {/* Error or Success Message */}
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
          {error && (
            <Notification
              icon={<IconX />}
              color="red"
              title="Error"
              mt="md"
              transition="slide-up"
              transitionDuration={500}
              autoClose={5000}
              onClose={() => setError('')}
            >
              {error}
            </Notification>
          )}

          {message && (
            <Notification
              icon={<IconCheck />}
              color="teal"
              title="Success!"
              mt="md"
              transition="slide-up"
              transitionDuration={500}
              autoClose={5000}
              onClose={() => setMessage('')}
            >
              {message}
            </Notification>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <Button type="submit"  disabled={loading} color='green'>
            {loading ? <Loader size="sm" /> : 'Reset Password'}
          </Button>
        </div>
      </form>

      {/* Forgot Password and Create Account Buttons (Styled inline) */}
      <Group position="left" spacing="sm" mt="sm">
        
           <Link to="/signin">
                      <Text size="lg" style={{textDecoration:"underline", color:"#40c057"}}>Back to Sign In</Text>
                    </Link>
       
      </Group>
    </div>
  );
};

export default ForgotPassword;
