import React, { useState } from 'react';
import { TextInput, Textarea, Button, Divider, Group, Box, NativeSelect, Rating, Notification, InputLabel } from '@mantine/core';
import axios from 'axios';
import { IconX, IconCheck } from '@tabler/icons-react';

function ReportContact() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '', rating: 0 });
  const [reportForm, setReportForm] = useState({ name: '', email: '', issueType: '', details: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const issueOptions = [
    { value: '', label: 'Select an issue' },
    { value: 'bug', label: 'Bug/Error' },
    { value: 'abuse', label: 'Harassment/Abuse' },
    { value: 'content', label: 'Inappropriate Content' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e, form, setForm) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (value) => {
    setContactForm({ ...contactForm, rating: value });
  };

  const handleSubmit = async (e, form, setForm, apiEndpoint, successMessage) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await axios.post(`http://localhost:3001/api/${apiEndpoint}`, form);
      setSuccess(successMessage);
      setForm({ name: '', email: '', message: '', rating: 0, issueType: '', details: '' });
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error(error);
    }
  };

  return (
    <Box mx="auto">
      <h3>Contact Us</h3>
      <form onSubmit={(e) => handleSubmit(e, contactForm, setContactForm, 'contact', 'Message sent successfully!')}>
        <div style={{ marginBottom: '10px' }}>
          <InputLabel>Your Name</InputLabel>
          <TextInput placeholder="Enter your name" name="name" value={contactForm.name} onChange={(e) => handleChange(e, contactForm, setContactForm)} required />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <InputLabel>Email Address</InputLabel>
          <TextInput placeholder="Enter your email" name="email" value={contactForm.email} onChange={(e) => handleChange(e, contactForm, setContactForm)} required />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <InputLabel>Rate Us</InputLabel>
          <Rating value={contactForm.rating} onChange={handleRatingChange} />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <InputLabel>Message</InputLabel>
          <Textarea placeholder="Type your message" name="message" value={contactForm.message} onChange={(e) => handleChange(e, contactForm, setContactForm)} required />
        </div>

        <Group position="right" mt="md">
          <Button type="submit" color="green">Send Message</Button>
        </Group>
      </form>

      <Divider my="lg" />

      <h3>Report an Issue</h3>
      <form onSubmit={(e) => handleSubmit(e, reportForm, setReportForm, 'report', 'Issue reported successfully!')}>
        <div style={{ marginBottom: '10px' }}>
          <InputLabel>Your Name</InputLabel>
          <TextInput placeholder="Enter your name" name="name" value={reportForm.name} onChange={(e) => handleChange(e, reportForm, setReportForm)} required />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <InputLabel>Email Address</InputLabel>
          <TextInput placeholder="Enter your email" name="email" value={reportForm.email} onChange={(e) => handleChange(e, reportForm, setReportForm)} required />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <InputLabel>Issue Type</InputLabel>
          <NativeSelect
            name="issueType"
            value={reportForm.issueType}
            onChange={(e) => setReportForm((prev) => ({ ...prev, issueType: e.target.value }))}
            data={issueOptions}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <InputLabel>Issue Details</InputLabel>
          <Textarea placeholder="Describe the issue in detail" name="details" value={reportForm.details} onChange={(e) => handleChange(e, reportForm, setReportForm)} required />
        </div>

        <Group position="right" mt="md">
          <Button type="submit" color="red">Report Issue</Button>
        </Group>
      </form>

      {/* Notifications */}
      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
        {error && (
          <Notification icon={<IconX />} color="red" title="Error" onClose={() => setError('')}>
            {error}
          </Notification>
        )}
        {success && (
          <Notification icon={<IconCheck />} color="teal" title="Success!" onClose={() => setSuccess('')}>
            {success}
          </Notification>
        )}
      </div>
    </Box>
  );
}

export default ReportContact;







