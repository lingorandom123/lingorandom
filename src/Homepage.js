import React from "react";
import {
  Container,
  Button,
  Group,
  Text,
  Title,
  Paper,
  Grid,
  Accordion,
  Image,
  Flex,
  Box
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import "./Homepage.css";
import head1 from "../src/Files/header.png"
import { FaRegLightbulb, FaHandshake, FaShieldAlt, FaGlobe } from "react-icons/fa";  // Icon imports

const guidelines = [
  {
    icon: FaRegLightbulb,
    title: "Be Curious",
    description:
      "Embrace learning with curiosity. Don't be afraid to make mistakes, they are part of the journey.",
  },
  {
    icon: FaHandshake,
    title: "Be Respectful",
    description:
      "Treat everyone with respect. Positive interactions help everyone learn and grow.",
  },
  {
    icon: FaShieldAlt,
    title: "Stay Safe",
    description:
      "Ensure your privacy by not sharing personal information. Report any inappropriate behavior immediately.",
  },
  {
    icon: FaGlobe,
    title: "Global Community",
    description:
      "Engage with users from around the world. Experience different cultures and languages.",
  },
];
const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
  <header className="header">
  <Container>
    <div className="header-inner">
      
    
        <div>
        
        <Title className="main-title" style={{ marginBottom: '10px', fontWeight:400 }}>
          Welcome to LingoRandom
        </Title>
     
          <Text className="tagline" style={{ marginBottom: '10px' }}>
          Connect with people worldwide and learn new languages together.
        </Text>
         
        <Button
          color="green"
          size="lg"
          className="cta-button"
          onClick={() => navigate("/servercampage")}
        >
          Chat Now
        </Button>
       
        </div>
        <div><img src={head1} height={300} width={300}/></div>
        
        {/* New section: Trendy Title + Bullet List */}
       
      
    </div>
  </Container>
</header>


    {/* About Section */}
    <section className="about-us" style={{ backgroundColor: "white",  alignContent:"center"}}>
        <Container>
          <Title className="main-title" style={{ marginBottom: "10px", fontWeight: 400, color:"black" }}>
            About LingoRandom & Guidelines
          </Title>
          <Text align="left" style={{ marginBottom: "30px", color:"#555"}}>
            Learn new languages while connecting with people from all over the world. Here are some guidelines to ensure a safe and fun experience.
          </Text>

        </Container>
      </section>


      {/* FAQ Section */}
      <section className="faq-section">
      <Container>
      <Title className="main-title" style={{ marginBottom: '10px', color:"black", fontWeight:400 }}>
          Frequently Asked
        </Title>
        <Grid>
          <Grid.Col span={12} md={6}>
            <Accordion>
              <Accordion.Item value="start">
                <Accordion.Control>How do I start a chat?</Accordion.Control>
                <Accordion.Panel>
                  Click "Chat Now" to be randomly connected to another user for a cam-to-cam conversation.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="languages">
                <Accordion.Control>What languages can I practice?</Accordion.Control>
                <Accordion.Panel>
                  You can practice any language! Just select your language preferences in your profile, and we will match you with users who speak or are learning that language.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="free">
                <Accordion.Control>Is the platform free to use?</Accordion.Control>
                <Accordion.Panel>
                  Yes! LingoRandom is completely free to use, offering unlimited language practice and random pairings.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="safety">
                <Accordion.Control>How is user safety ensured?</Accordion.Control>
                <Accordion.Panel>
                  We prioritize safety. You can report inappropriate behavior, and there are controls in place to block or skip users during a chat. All users must sign in to access the platform.
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Grid.Col>

         
        </Grid>
      </Container>
    </section>
  


   

   
    </div>
  );
};

export default Homepage;