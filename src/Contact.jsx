import React, { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('Sending…');

    const { name, email, message } = form;
    const phoneNumber = '2349037558818';
    const text = `Hi AAUNightlife. My name is ${name} with email ${email}. Message: ${message}`;
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;

    try {
      const res = await fetch(
        'https://aau-nightlife-production.up.railway.app/api/contact',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );

      if (res.ok) {
        setStatus('Message sent! Redirecting to WhatsApp…');
      } else {
        setStatus('API error—redirecting to WhatsApp…');
      }
    } catch (err) {
      setStatus('Network error—redirecting to WhatsApp…');
    } finally {
      // always redirect
      window.open(whatsappURL, '_blank');
      // reset form fields
      setForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <section className="event-section">
      <h2>Contact Us</h2>
      <p>
        Event organizers can reach out for promotion services using the form
        below.
      </p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Message:
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">Send</button>
      </form>

      {status && <p className="status">{status}</p>}
    </section>
  );
}