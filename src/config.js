// API Configuration
// Update this URL when migrating between hosting providers
export const API_BASE_URL = 'https://aau-nightlife-backend.onrender.com';

// API endpoints
export const API_ENDPOINTS = {
  // Events
  events: `${API_BASE_URL}/api/events`,

  // Jobs
  jobs: `${API_BASE_URL}/api/jobs`,

  // Blog
  blogPosts: `${API_BASE_URL}/api/blog-posts`,
  blogComments: `${API_BASE_URL}/api/blog-comments`,

  // Admin
  adminLogin: `${API_BASE_URL}/api/admin/login`,
  adminLogout: `${API_BASE_URL}/api/admin/logout`,
  adminVerify: `${API_BASE_URL}/api/admin/verify`,

  // Contact
  contact: `${API_BASE_URL}/api/contact`,

  // Advertisers
  advertisers: `${API_BASE_URL}/api/advertisers`,

  // Hero Images
  heroImages: `${API_BASE_URL}/api/hero-images`,

  // Awards / Voting
  awards: `${API_BASE_URL}/api/awards`,
  verifyPayment: `${API_BASE_URL}/api/payments/verify`,

  // Paystack
  paystackInitialize: 'https://api.paystack.co/transaction/initialize',
  paystackVerify: 'https://api.paystack.co/transaction/verify'
};

// Paystack Configuration
export const PAYSTACK_CONFIG = {
  publicKey: 'pk_test_your_paystack_public_key_here', // Replace with your actual public key
  secretKey: 'sk_test_your_paystack_secret_key_here'  // Replace with your actual secret key
};

export default API_BASE_URL;
