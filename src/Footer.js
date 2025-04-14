import React from "react";
import { Link } from "react-router-dom";
import { Container, Group, Text, ActionIcon } from "@mantine/core";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import "./Homepage.css";

const Footer = () => {
  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${window.location.href}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleShareInstagram = () => {
    alert("Instagram doesn't allow direct URL sharing from browsers.");
  };

  const handleShareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`,
      "_blank",
      "width=600,height=400"
    );
  };

  return (
    <footer style={{ paddingBottom: '50px', backgroundColor: "#f5f5f5", padding: "20px 0" }}>
      <Container>
        <div style={{ fontSize: '1.5rem' }}>
          <Group
            style={{
              display: 'flex',
              justifyContent: 'left',
              width: '100%',
              alignItems: "baseline",
              flexWrap: "wrap"
            }}
          >
          <div style={{ marginTop: "10px", textAlign: 'left', flex: "0 0 30%" }}>

{/* Company Info + Sign Up */}
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'left', justifyContent: 'center', marginTop: "10px" }}>
  <Text size="sm" weight={500}>Company</Text>
  <Text style={{ color: "#555" }}>
    Suntrust Global LLC<br />
    Copyright lingorandom.com, 2025
  </Text>
  <Link to="/createaccount">
    <Text style={{ textDecoration: "underline", color: "#40c057" }}>Sign Up</Text>
  </Link>
</div>

{/* Social Media Icons */}
<div style={{ marginTop: "10px", marginBottom: "10px" }}>
  <Group spacing={20}>
    <ActionIcon
      onClick={handleShareFacebook}
      style={{ cursor: 'pointer', backgroundColor: "#3b5998", padding: "7px", borderRadius: "50%" }}>
      <FaFacebook size={50} color="#fff" />
    </ActionIcon>
    <ActionIcon
      onClick={handleShareTwitter}
      style={{ cursor: 'pointer', backgroundColor: "#1DA1F2", padding: "7px", borderRadius: "50%" }}>
      <FaTwitter size={50} color="#fff" />
    </ActionIcon>
    <ActionIcon
      onClick={handleShareInstagram}
      style={{ cursor: 'pointer', backgroundColor: "#E4405F", padding: "7px", borderRadius: "50%" }}>
      <FaInstagram size={50} color="#fff" />
    </ActionIcon>
    <ActionIcon
      onClick={handleShareLinkedIn}
      style={{ cursor: 'pointer', backgroundColor: "#0077B5", padding: "7px", borderRadius: "50%" }}>
      <FaLinkedin size={50} color="#fff" />
    </ActionIcon>
  </Group>
 
</div>

{/* Consent Info */}

</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'left', flex: "0 0 30%" }}>
              <Text size="sm" weight={500}>Legal</Text>
              <Link to="/legal">
                <Text style={{ textDecoration: "underline", color: "#40c057" }}>Contact / Report an Issue</Text>
              </Link>
              <Link to="/legal">
                <Text style={{ textDecoration: "underline", color: "#40c057" }}>Privacy Policy</Text>
              </Link>
              <Link to="/legal">
                <Text style={{ textDecoration: "underline", color: "#40c057" }}>Terms & Conditions</Text>
              </Link>

             
            </div>

            {/* User Consent Section */}
           
            <div style={{ marginTop: "10px", textAlign: 'left', flex: "0 0 30%" }}>
              <Text size="sm" weight={500}>User Consent</Text>
              <Text style={{ color: "#555" }}>
                By using our platform, you agree to the collection, use, and processing of your data as outlined in our
                <Link to="/legal">
                  <Text component="span" style={{ textDecoration: "underline", color: "#40c057" }}> Community Guidelines</Text>
                </Link>
              </Text></div>
          </Group>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
