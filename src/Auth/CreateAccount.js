import React, { useState, useEffect } from "react";
import { auth, db } from "../Auth/Firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, deleteUser } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Modal, NativeSelect, MultiSelect, Input, Button, Text, Checkbox, Loader, InputLabel, Notification } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from "react-router-dom";
import ISO6391 from 'iso-639-1';
import './Auth.css';
import logo from '../Files/lingo.svg';
import { IconX, IconCheck } from '@tabler/icons-react';

function CreateAccount() {
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [error, setError] = useState(null); // To store error messages
  const [success, setSuccess] = useState(null); // To store success messages
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  
    const fetchLanguages = async () => {
      try {
        const API_KEY = "AIzaSyCGVK0wzYz3tNlh2i2d6-2B-GB-6WQssrc"; // Replace with your Google API Key
        const response = await fetch(
          `https://translation.googleapis.com/language/translate/v2/languages?key=${API_KEY}&target=en`
        );
  
        const data = await response.json();
  
        if (response.ok && data?.data?.languages) {
          const languageOptions = data.data.languages.map(({ language, name }) => ({
            value: language,
            label: name,
          }));
  
          setLanguages(languageOptions);
        } else {
          console.error("Error fetching languages:", data);
        }
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };
    fetchLanguages();
  }, []);

  const form = useForm({
    initialValues: {
      displayName: '',
      email: '',
      password: '',
      country: '',
      nativeLanguage: [],
      languagesLearning: [],
      termsAccepted: false,
    },
    validate: {
      displayName: (value) => (value ? null : 'Display Name is required'),
      email: (value) => (value ? null : 'Email is required'),
      password: (value) => (value.length >= 6 ? null : 'Password should be at least 6 characters'),
      country: (value) => (value ? null : 'Country is required'),
      nativeLanguage: (value) => (value.length ? null : 'Please select your native language'),
      languagesLearning: (value) => (value.length ? null : 'Please select at least one language you are learning'),
      termsAccepted: (value) => (value ? null : 'You must accept the terms, privacy policy, and confirm you are at least 18 years old'),
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent page reload on submit
  
    if (!form.isValid()) {
      return; // Prevent submission if form is invalid
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.values.email, form.values.password);
      const newUser = userCredential.user;
      setUser(newUser);
  
      await sendEmailVerification(newUser);
      setIsVerifying(true);
  
      let intervalId = setInterval(async () => {
        setTimeLeft((prevTimeLeft) => {
          const newTimeLeft = prevTimeLeft - 1; // Decrement the time left
  
          if (newTimeLeft <= 0) {
            clearInterval(intervalId); // Clear interval if time is up
            handleVerificationFailed(newUser); // Call failure handler
            return 0; // Set timeLeft to 0
          }
  
          // Check if email is verified
          newUser.reload().then(() => {
            if (newUser.emailVerified) {
              clearInterval(intervalId); // Clear interval if email is verified
              handleVerifiedUser(newUser); // Call success handler
            }
          });
  
          return newTimeLeft; // Return updated timeLeft value
        });
      }, 1000);
  
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";
  
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use. Try logging in.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format. Please check your email.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      }
  
      setError(errorMessage); // Set error message to display in Notification
      setSuccess(null); // Reset success message
    }
  };

  const handleVerifiedUser = async (verifiedUser) => {
    try {
      // Map over the nativeLanguage and languagesLearning arrays to save both value and label
      const nativeLanguageData = form.values.nativeLanguage.map((langCode) => ({
        value: langCode,
        label: ISO6391.getName(langCode), // Get the language name based on the code
      }));
  
      const languagesLearningData = form.values.languagesLearning.map((langCode) => ({
        value: langCode,
        label: ISO6391.getName(langCode), // Get the language name based on the code
      }));
  
      // Save user data to Firestore
      await setDoc(doc(db, "users", verifiedUser.uid), {
        displayName: form.values.displayName,
        email: verifiedUser.email,
        country: form.values.country,
        nativeLanguage: nativeLanguageData, // Store the array with value and label
        languagesLearning: languagesLearningData, // Store the array with value and label
        uid: verifiedUser.uid,
      });
  
      setSuccess("Your email has been verified. Account created successfully.");
      setError(null); // Reset any error message
      navigate("/myaccount");
    } catch (error) {
      setError("Something went wrong while saving your data. Please try again.");
      setSuccess(null); // Reset success message
    }
  };
  const handleVerificationFailed = async (unverifiedUser) => {
    setVerificationFailed(true);
  
    try {
      await deleteUser(unverifiedUser); // Delete unverified user
    } catch (error) {
      console.error("Error deleting unverified user:", error);
    }
  
    setTimeout(() => {
      navigate("/"); // Redirect after 3 seconds
    }, 3000);
  };
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="auth">
      <h3>Create Account</h3>

      <form onSubmit={handleSubmit}>
        {/* Form Fields */}
        <div>
          <InputLabel required>Display Name</InputLabel>
          <Input {...form.getInputProps('displayName')} placeholder="Enter your display name" label="Display Name" required searchable />
        </div>
        <div>
          <InputLabel required>Email</InputLabel>
          <Input {...form.getInputProps('email')} placeholder="Enter your email" label="Email" required searchable />
        </div>
        <div>
          <InputLabel required>Password</InputLabel>
          <Input {...form.getInputProps('password')} type="password" placeholder="Enter your password" label="Password" required searchable />
        </div>
        <div>
          <NativeSelect {...form.getInputProps('country')} data={countries.map(country => country.name.common)} placeholder="Select Country" label="Country" required searchable />
        </div>
        <div>
          <MultiSelect {...form.getInputProps('nativeLanguage')} data={languages} placeholder="Select Native Language" searchable required label="Native Language" />
        </div>
        <div>
          <MultiSelect {...form.getInputProps('languagesLearning')} data={languages} placeholder="Select Languages You're Learning" searchable required label="Languages Learning" />
        </div>
        <div>
          <InputLabel required>Accept our policies</InputLabel>
          <Checkbox {...form.getInputProps('termsAccepted', { type: 'checkbox' })} label="I accept the Terms, Privacy Policy, and confirm I am at least 18 years old." required />
        </div>

        {/* Submit Button */}
       
          <Button variant="filled" color="green" type="submit">
            Create Account
          </Button>
        
      </form>

      {/* Display Form Errors */}
      {form.errors && <Text color="red">{Object.values(form.errors).join(', ')}</Text>}

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
            autoClose={5000} // Auto-close after 5 seconds
            onClose={() => setError(null)} // Close on cancel
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
            autoClose={5000} // Auto-close after 5 seconds
            onClose={() => setSuccess(null)} // Close on cancel
          >
            {success}
          </Notification>
        )}
      </div>

      {/* Verification Modal */}
      <Modal opened={isVerifying} onClose={() => {}} withCloseButton={false} centered>
        {!verificationFailed ? (
          <>
            <img onClick={() => navigate('/')} src={logo} height="50" width="50" alt="logo" />
            <div>
              <InputLabel>Verify Your Email</InputLabel>
              <Text size="sm" style={{ color: "#555" }}>Please check your email for a verification link. Your account will not be created until you verify.</Text>
              <Loader size="xs" color="green" />
              <Text color="green" size="sm">Time remaining: {formatTime(timeLeft)}</Text>
            </div>
          </>
        ) : (
          <>
            <img onClick={() => navigate('/')} src={logo} height="50" width="50" alt="logo" />
            <div>
              <InputLabel>Verification could not be completed</InputLabel>
              <Text size="sm" style={{ color: "#555" }}>Sorry, your account couldn't be verified. Please try again later.</Text>
              <Loader size="sm" color="red" />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default CreateAccount;