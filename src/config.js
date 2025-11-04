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
  paystackInitialize: `${API_BASE_URL}/api/payments/initialize`,
  paystackVerify: `${API_BASE_URL}/api/payments/verify`
};

// Paystack Configuration
export const PAYSTACK_CONFIG = {
  publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_live_23f8650090898b284b0d9b8ea85614e7138772b9'
};

export default API_BASE_URL;
