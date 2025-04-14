import React, { useState, useEffect } from "react";
import { Input, MultiSelect, Button, Notification, Text, Loader, InputLabel, Group, UnstyledButton } from "@mantine/core";
import { auth } from "../src/Auth/Firebase";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";  // Correct import for Firebase
import { IconX, IconCheck } from '@tabler/icons-react'; // Icons for notifications

const db = getFirestore();

const MyAccount = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  // State variables
  const [displayName, setDisplayName] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState([]);
  const [languagesLearning, setLanguagesLearning] = useState([]);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Variables to store initial values
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [initialNativeLanguage, setInitialNativeLanguage] = useState([]);
  const [initialLanguagesLearning, setInitialLanguagesLearning] = useState([]);

  // Edit mode flags
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [isEditingNativeLanguage, setIsEditingNativeLanguage] = useState(false);
  const [isEditingLanguagesLearning, setIsEditingLanguagesLearning] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Fetched Data from Firestore:", data);

          // Set state using the correct data structure
          setDisplayName(data.displayName || "");
          setNativeLanguage(data.nativeLanguage.map(item => item.value) || []);
          setLanguagesLearning(data.languagesLearning.map(item => item.value) || []);
          setEmail(data.email || "");
          setCountry(data.country || "");

          // Set initial values for cancel functionality
          setInitialDisplayName(data.displayName || "");
          setInitialNativeLanguage(data.nativeLanguage.map(item => item.value) || []);
          setInitialLanguagesLearning(data.languagesLearning.map(item => item.value) || []);
        } else {
          console.log("User data does not exist");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError('Error fetching user data. Please try again later.');
      }

      setLoading(false);
    };

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

    fetchUserData();
    fetchLanguages();
  }, [user]);

  // Handle saving the display name to Firebase
  const handleSaveDisplayName = async () => {
    if (!user || !displayName) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { displayName });

      setSuccess('Display name updated successfully!');
      setIsEditingDisplayName(false);  // Disable editing after saving
    } catch (error) {
      console.error("Error updating display name:", error);
      setError('Failed to update display name. Please try again later.');
    }
  };

  // Handle saving the native language to Firebase
  const handleSaveNativeLanguage = async () => {
    if (!user) return;
    try {
      if (!nativeLanguage || nativeLanguage.length === 0) {
        throw new Error("Please select at least one native language.");
      }

      const updatedNativeLanguages = nativeLanguage.map((langCode) => ({
        value: langCode,
        label: languages.find(lang => lang.value === langCode)?.label || langCode,
      }));

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { nativeLanguage: updatedNativeLanguages });

      setSuccess('Native language updated successfully!');
      setIsEditingNativeLanguage(false);  // Disable editing after saving
    } catch (error) {
      console.error("Error updating native language:", error);
      setError('Failed to update native language. Please try again later.');
    }
  };

  // Handle saving the languages learning to Firebase
  const handleSaveLanguagesLearning = async () => {
    if (!user) return;
    try {
      if (!languagesLearning || languagesLearning.length === 0) {
        throw new Error("Please select at least one language you are learning.");
      }

      const updatedLanguagesLearning = languagesLearning.map((langCode) => ({
        value: langCode,
        label: languages.find(lang => lang.value === langCode)?.label || langCode,
      }));

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { languagesLearning: updatedLanguagesLearning });

      setSuccess('Languages learning updated successfully!');
      setIsEditingLanguagesLearning(false);  // Disable editing after saving
    } catch (error) {
      console.error("Error updating languages learning:", error);
      setError('Failed to update languages learning. Please try again later.');
    }
  };

  // Cancel changes for display name
  const handleCancelDisplayName = () => {
    setDisplayName(initialDisplayName);
    setIsEditingDisplayName(false);
  };

  // Cancel changes for native language
  const handleCancelNativeLanguage = () => {
    setNativeLanguage(initialNativeLanguage);
    setIsEditingNativeLanguage(false);
  };

  // Cancel changes for languages learning
  const handleCancelLanguagesLearning = () => {
    setLanguagesLearning(initialLanguagesLearning);
    setIsEditingLanguagesLearning(false);
  };

  // Password reset function
  const resetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);  // Correct usage
      setSuccess('Password reset email sent.');
    } catch (error) {
      setError('Error sending password reset email. Please try again.');
      console.error(error);
    }
  };

  // Delete user account function
  const deleteAccount = async () => {
    try {
      await deleteDoc(doc(db, "users", user.uid));
      await user.delete();
      navigate("/login");
    } catch (error) {
      setError('Error deleting account. Please try again.');
    }
  };

  // Log out function
  const logout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      setError('Error logging out. Please try again.');
    }
  };

  if (loading) return <Loader size="sm" color="green" />;

  return (
    <div style={{ padding: "20px" }}>
      <h3>My Account</h3>
      <Text>Email: {email}</Text>
      <Text>Country: {country}</Text>
      <InputLabel>Display Name</InputLabel>
      <Input
        label="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        disabled={!isEditingDisplayName}  // Disable input when not editing
      />
      <UnstyledButton onClick={() => setIsEditingDisplayName(true)} style={{ color: "#40c057", textDecoration: "underline", marginRight:"10px" }}>Edit</UnstyledButton>
      {isEditingDisplayName && (
        <>
          <UnstyledButton style={{ color: "#40c057", textDecoration: "underline", cursor: "pointer", marginRight:"10px" }} onClick={handleCancelDisplayName}>Cancel</UnstyledButton>
          <UnstyledButton style={{ color: "#40c057", textDecoration: "underline", cursor: "pointer" }} onClick={handleSaveDisplayName}>Save Changes</UnstyledButton>
        </>
      )}

      <MultiSelect
        label="Native Language"
        data={languages}
        value={nativeLanguage}
        onChange={setNativeLanguage}
        disabled={!isEditingNativeLanguage}  // Disable when not editing
      />
      <UnstyledButton onClick={() => setIsEditingNativeLanguage(true)} style={{ color: "#40c057", textDecoration: "underline", marginRight:"10px" }}>Edit</UnstyledButton>
      {isEditingNativeLanguage && (
        <>
          <UnstyledButton style={{ color: "#40c057", textDecoration: "underline", cursor: "pointer", marginRight:"10px" }} onClick={handleCancelNativeLanguage}>Cancel</UnstyledButton>
          <UnstyledButton style={{ color: "#40c057", textDecoration: "underline", cursor: "pointer" }} onClick={handleSaveNativeLanguage}>Save Changes</UnstyledButton>
        </>
      )}

      <MultiSelect
        label="Languages Learning"
        data={languages}
        value={languagesLearning}
        onChange={setLanguagesLearning}
        disabled={!isEditingLanguagesLearning}  // Disable when not editing
      />
      <UnstyledButton size="lg" onClick={() => setIsEditingLanguagesLearning(true)} style={{ color: "#40c057", textDecoration: "underline", marginRight:"10px" }}>Edit</UnstyledButton>
      {isEditingLanguagesLearning && (
        <>
          <UnstyledButton size="lg" style={{ color: "#40c057", textDecoration: "underline", cursor: "pointer", marginRight:"10px" }} onClick={handleCancelLanguagesLearning}>Cancel</UnstyledButton>
          <UnstyledButton style={{ color: "#40c057", textDecoration: "underline", cursor: "pointer" }} onClick={handleSaveLanguagesLearning}>Save Changes</UnstyledButton>
        </>
      )}

      <Group mt="md">
        <UnstyledButton
          onClick={resetPassword}
          style={{ color: "#40c057", textDecoration: "underline", cursor: "pointer" }}
        >
          Reset Password
        </UnstyledButton>

        <UnstyledButton
          onClick={logout}
          style={{ color: "#40c057", textDecoration: "underline", cursor: "pointer" }}
        >
          Logout
        </UnstyledButton>

        <UnstyledButton
          onClick={deleteAccount}
          style={{ color: "#40c057", textDecoration: "underline", cursor: "pointer" }}
        >
          Delete Account
        </UnstyledButton>
      </Group>

      {/* Display Notifications */}
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

export default MyAccount;


