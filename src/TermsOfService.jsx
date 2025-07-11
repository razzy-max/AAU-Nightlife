import React from 'react';

export default function TermsOfService() {
  return (
    <section className="event-section" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>Terms of Service</h1>
      <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using AAU Nightlife Ekpoma ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        AAU Nightlife Ekpoma is a platform that provides information about student events, job opportunities, and campus culture for the Ambrose Alli University community in Ekpoma, Edo State, Nigeria.
      </p>

      <h2>3. User Responsibilities</h2>
      <p>Users agree to:</p>
      <ul>
        <li>Provide accurate and truthful information</li>
        <li>Use the service for lawful purposes only</li>
        <li>Respect the rights and dignity of other users</li>
        <li>Not post harmful, offensive, or inappropriate content</li>
        <li>Not engage in spam or fraudulent activities</li>
      </ul>

      <h2>4. Content Guidelines</h2>
      <p>All content submitted to our platform must:</p>
      <ul>
        <li>Be relevant to the AAU student community</li>
        <li>Be respectful and appropriate</li>
        <li>Not contain false or misleading information</li>
        <li>Not violate any laws or regulations</li>
        <li>Not infringe on intellectual property rights</li>
      </ul>

      <h2>5. Prohibited Content</h2>
      <p>The following content is strictly prohibited:</p>
      <ul>
        <li>Illegal activities or content</li>
        <li>Hate speech or discriminatory content</li>
        <li>Adult or explicit content</li>
        <li>Violence or threats</li>
        <li>Spam or fraudulent content</li>
        <li>Copyright infringement</li>
      </ul>

      <h2>6. Content Moderation</h2>
      <p>
        We reserve the right to review, edit, or remove any content that violates these terms or is deemed inappropriate for our platform.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        Users retain ownership of content they submit but grant us a license to use, display, and distribute such content on our platform.
      </p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>
        The service is provided "as is" without any warranties, express or implied. We do not guarantee the accuracy, completeness, or reliability of any content.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        AAU Nightlife Ekpoma shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of our service.
      </p>

      <h2>10. Privacy</h2>
      <p>
        Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.
      </p>

      <h2>11. Termination</h2>
      <p>
        We may terminate or suspend access to our service immediately, without prior notice, for conduct that we believe violates these terms.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the modified terms.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These terms shall be governed by and construed in accordance with the laws of Nigeria.
      </p>

      <h2>14. Contact Information</h2>
      <p>
        For questions about these terms, please contact us:
      </p>
      <ul>
        <li>Email: aaunightlife@gmail.com</li>
        <li>WhatsApp: +234 903 755 8818</li>
        <li>Address: Ekpoma, Edo State, Nigeria</li>
      </ul>
    </section>
  );
}
