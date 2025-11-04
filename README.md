# AAU Nightlife

## Environment Variables Setup

### Paystack Configuration

To securely configure Paystack payment processing, set the following environment variables:

#### Server Environment Variables (server/.env)
```
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
```

#### Client Environment Variables (.env)
```
REACT_APP_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
```

### Getting Paystack Keys

1. Sign up for a Paystack account at [https://paystack.com](https://paystack.com)
2. Navigate to Settings > API Keys & Webhooks in your dashboard
3. Copy your public key for the client-side configuration
4. Copy your secret key for the server-side configuration

### Security Notes

- Never commit `.env` files to version control
- The secret key should only be used server-side for payment verification
- The public key is safe to use in client-side code
- Environment variables are automatically loaded by the dotenv package in the server

### Running the Application

1. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   ```

2. Set up environment variables as described above

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Start the backend server:
   ```bash
   cd server && npm start
