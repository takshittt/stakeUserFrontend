import { createThirdwebClient } from "thirdweb";
import { createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";

declare const process: {
  env: {
    NEXT_PUBLIC_CLIENT_ID?: string;
    NEXT_PUBLIC_DOMAIN?: string;
    NEXT_PUBLIC_PRIVATE_KEY?: string;
  };
};

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || "";
export const client = createThirdwebClient({
  clientId: CLIENT_ID || "",
});

// Create auth instance for SIWE (Sign-In with Ethereum)
export const thirdwebAuth = createAuth({
  domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000", // Make sure this matches your domain
  client,
  adminAccount: privateKeyToAccount({
    client,
    privateKey: process.env.NEXT_PUBLIC_PRIVATE_KEY || "",
  }),
});
