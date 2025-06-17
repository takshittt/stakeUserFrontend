# MindWave DAO - Staking Platform

A decentralized staking platform built with Next.js and Thirdweb.

## Features

- Connect wallet with Thirdweb authentication
- View staking packages
- Stake tokens with various durations
- Track staking rewards
- Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Thirdweb v5 SDK
- Ethers.js v5
- Cloudflare Pages for deployment

## Local Development

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/stakeUserFrontend.git
   cd stakeUserFrontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   NEXT_PUBLIC_CLIENT_ID=your_thirdweb_client_id
   NEXT_PUBLIC_DOMAIN=localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_PRIVATE_KEY=your_private_key_for_auth
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Cloudflare Pages

### Method 1: Direct Deployment from Cloudflare Dashboard

1. Log in to your Cloudflare account.

2. Navigate to **Pages** > **Create a project** > **Connect to Git**.

3. Select your repository and configure the following settings:

   - **Project name**: `staketoken` (or your preferred name)
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`

4. Add the following environment variables in the **Environment variables** section:

   - `NEXT_PUBLIC_CLIENT_ID`: Your Thirdweb client ID
   - `NEXT_PUBLIC_DOMAIN`: Your Cloudflare Pages domain (e.g., `staketoken.pages.dev`)
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `NEXT_PUBLIC_PRIVATE_KEY`: Your private key for Thirdweb auth

5. Click **Save and Deploy**.

### Method 2: Deployment via GitHub Actions

1. Set up the following secrets in your GitHub repository:

   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Pages access
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
   - `NEXT_PUBLIC_CLIENT_ID`: Your Thirdweb client ID
   - `NEXT_PUBLIC_DOMAIN`: Your Cloudflare Pages domain
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `NEXT_PUBLIC_PRIVATE_KEY`: Your private key for Thirdweb auth

2. Push changes to the `main` branch to trigger deployment.

### Method 3: Manual Deployment with Wrangler CLI

1. Install Wrangler CLI:

   ```bash
   npm install -g wrangler
   ```

2. Log in to your Cloudflare account:

   ```bash
   wrangler login
   ```

3. Build your project:

   ```bash
   npm run build
   ```

4. Deploy to Cloudflare Pages:
   ```bash
   wrangler pages deploy out
   ```

## Important Notes

- Ensure your backend API has CORS configured to allow requests from your Cloudflare Pages domain.
- Do not store your private key in version-controlled files. Use environment variables instead.
- For production, consider using a more secure authentication method than storing private keys in environment variables.

## License

[MIT](LICENSE)
