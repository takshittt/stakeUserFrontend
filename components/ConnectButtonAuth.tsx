"use client";

import { useEffect, useState } from "react";
import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { client, thirdwebAuth } from "../src/app/client";
import { chain } from "../src/app/chain";
import Stake from "./Stake";
import "./ConnectButtonAuth.css";

export default function ConnectButtonAuth() {
  const [isLoggedInState, setIsLoggedInState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  // Generate login payload using thirdweb auth
  async function getLoginPayload(params: { address: string }) {
    try {
      setError(null);
      setIsLoading(true);
      console.log("Generating login payload for:", params.address);

      // Generate a SIWE (Sign-In with Ethereum) payload
      const payload = await thirdwebAuth.generatePayload({
        address: params.address,
        chainId: chain.id,
        // You can add additional statement or data here if needed
      });

      console.log("Login payload generated:", payload);
      return payload;
    } catch (err) {
      console.error("Failed to generate login payload:", err);
      setError("Failed to generate login payload. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  // Verify the signed payload
  async function doLogin(params: any) {
    try {
      setError(null);
      setIsLoading(true);
      console.log("Verifying login payload:", params);

      // Verify the signed payload
      const verifiedPayload = await thirdwebAuth.verifyPayload(params);

      console.log("Verification result:", verifiedPayload);

      if (verifiedPayload.valid) {
        setIsLoggedInState(true);
        console.log("Login successful - user authenticated!");
      } else {
        setError("Login verification failed. Please try again.");
        console.error("Login failed - invalid payload");
      }
    } catch (err) {
      console.error("Login verification error:", err);
      setError("Login verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Check if user is logged in
  async function isLoggedIn() {
    // In a real application, you might want to check with your backend
    // or use localStorage/cookies to persist the login state
    return isLoggedInState;
  }

  // Handle logout
  async function doLogout() {
    try {
      setError(null);
      setIsLoading(true);
      console.log("Logging out user");

      // Reset the login state
      setIsLoggedInState(false);

      // Disconnect the wallet if connected
      if (activeWallet) {
        disconnect(activeWallet);
      }

      console.log("User logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Check login state when wallet changes
  useEffect(() => {
    if (!account?.address) {
      setIsLoggedInState(false);
    }
  }, [account?.address]);

  // Debug state changes
  useEffect(() => {
    console.log("Auth state changed:", {
      hasAddress: !!account?.address,
      isLoggedIn: isLoggedInState,
      isLoading: isLoading,
    });
  }, [account?.address, isLoggedInState, isLoading]);

  return (
    <div className="connect-container">
      {error && (
        <div className="error-container">
          <p className="error-title">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {!isLoggedInState && (
        <div className="connect-title-container">
          <h2 className="connect-title">
            <span className="gradient-text">Start Staking</span>
          </h2>
          <p className="connect-description">
            Connect your wallet to access staking packages
          </p>
        </div>
      )}

      {isLoading && (
        <div className="loading-indicator">
          <p>Loading...</p>
        </div>
      )}

      {account?.address && isLoggedInState ? (
        // Show staking page when user is authenticated
        <Stake />
      ) : (
        // Show connect button when user is not authenticated
        <div className="connect-button-container">
          <ConnectButton
            client={client}
            auth={{
              getLoginPayload,
              doLogin,
              isLoggedIn,
              doLogout,
            }}
          />
        </div>
      )}
    </div>
  );
}
