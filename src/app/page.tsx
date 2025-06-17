"use client";

import { useState, useEffect } from "react";
import ConnectButtonAuth from "../../components/ConnectButtonAuth";
import Link from "next/link";
import Image from "next/image";
import { useActiveAccount } from "thirdweb/react";
import "./page.css";

export default function Home() {
  const account = useActiveAccount();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(!!account?.address);
  }, [account?.address]);

  return (
    <main className="main">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-image">
              <Image
                src="/images/logo.webp"
                alt="MindWave DAO Logo"
                width={180}
                height={46}
                priority
              />
            </div>
          </div>
        </div>
      </header>

      {/* Conditional rendering based on connection status */}
      {!isConnected ? (
        <>
          {/* Info Section - shown only when not connected */}
          <section className="info-section">
            <div className="info-container">
              <div className="info-indicator">
                <div className="info-dot"></div>
                <p className="info-label">THE PROBLEM WE SOLVE</p>
              </div>

              <h1 className="info-title">
                Empowering Decentralized Finance with <br />
                <span className="gradient-text">Bitcoin-Backed Solutions</span>
              </h1>

              <p className="info-description">
                MindWaveDAO tackles the critical gaps in today's decentralized
                landscape through a unified, Bitcoin-yield-powered
                ecosystem—converting attention, trust, and environmental action
                into tangible, verifiable value.
              </p>
            </div>
          </section>

          {/* Connect wallet section */}
          <div className="content-section">
            <ConnectButtonAuth />
          </div>
        </>
      ) : (
        // When connected, just show the ConnectButtonAuth component
        <div className="content-section-connected">
          <ConnectButtonAuth />
        </div>
      )}
    </main>
  );
}
