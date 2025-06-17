"use client";

import { useEffect, useState } from "react";
import { ethers, BigNumber, utils } from "ethers";
import { get } from "../lib/api";
import TableComponent from "./TableComponent";
import "./Stake.css";

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

type Package = {
  _id: string;
  name: string;
  reward: string;
  durationOptions: number[];
  isDisabled?: boolean;
  stakeTokenAddress: string;
  stakingAddress: string;
  stakeTokenAddressAbi: any;
  stakingAddressAbi: any;
};

interface StakeInfo {
  amount: BigNumber;
  rewardDebt: BigNumber;
  lastClaimTime: BigNumber;
  stakeTime: number;
  lockDuration: number;
  claimed: boolean;
  withdrawn: boolean;
  withdrawnAmount: BigNumber;
  fullRewardClaimed: boolean;
}

const StakeActions = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showDurationModal, setShowDurationModal] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>(
    {}
  );
  const [stakedBalances, setStakedBalances] = useState<Record<string, string>>(
    {}
  );

  // 1. Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await get({ url: "/packages" });
        if (res.success && res.data) {
          const formatted = res.data.map((pkg: any) => ({
            ...pkg,
            reward: BigNumber.isBigNumber(pkg.reward)
              ? (parseFloat(utils.formatEther(pkg.reward)) * 100).toFixed(2)
              : typeof pkg.reward === "number"
              ? pkg.reward.toFixed(2)
              : pkg.reward,
          }));
          setPackages(formatted);
        } else {
          setPackages([]);
        }
      } catch (err) {
        console.error("Failed to fetch packages.", err);
        setPackages([]);
      }
    };

    fetchPackages();
  }, []);

  // 2. Connect wallet and get user address
  useEffect(() => {
    const getUserAddress = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setUserAddress(accounts[0]);
        } catch (error) {
          console.error("Wallet connection error", error);
        }
      }
    };

    getUserAddress();
  }, []);

  // 3. Fetch token balances for all packages
  useEffect(() => {
    if (!userAddress || packages.length === 0) return;

    const fetchTokenBalances = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balances: Record<string, string> = {};

      for (const pkg of packages) {
        const tokenContract = new ethers.Contract(
          pkg.stakeTokenAddress,
          pkg.stakeTokenAddressAbi,
          provider
        );
        const rawBalance: BigNumber = await tokenContract.balanceOf(
          userAddress
        );
        const decimals: number = await tokenContract.decimals();
        balances[pkg.stakeTokenAddress] = utils.formatUnits(
          rawBalance,
          decimals
        );
      }

      setTokenBalances(balances);
    };

    fetchTokenBalances();
  }, [userAddress, packages.length]); // ✅ Use length, not full packages object

  // 4. Fetch staked balances, claimable rewards, and claimed rewards
  useEffect(() => {
    if (!userAddress || packages.length === 0) return;

    const fetchStakedData = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const staked: Record<string, string> = {};
      const claimable: Record<string, string> = {};
      const claimed: Record<string, string> = {};

      for (const pkg of packages) {
        const stakingContract = new ethers.Contract(
          pkg.stakingAddress,
          pkg.stakingAddressAbi,
          provider
        );
        const userStakes: StakeInfo[] =
          await stakingContract.getUserStakeDetailsWithRewards(userAddress);

        let totalStaked = BigNumber.from(0);

        for (let i = 0; i < userStakes.length; i++) {
          const s = userStakes[i];
          totalStaked = totalStaked.add(s.amount);
        }

        staked[pkg.stakingAddress] = utils.formatEther(totalStaked);
      }

      setStakedBalances(staked);
    };

    fetchStakedData();
  }, [userAddress, packages.length]); // ✅ Same here

  const handleBack = () => {
    setSelectedPackage(null);
    setShowDurationModal(false);
  };

  const formatNumber = (numStr?: string) => {
    const num = parseFloat(numStr || "0");
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 4,
    }).format(num);
  };

  return (
    <>
      {showDurationModal && selectedPackage ? (
        <TableComponent selectedPackage={selectedPackage} onBack={handleBack} />
      ) : (
        <div className="stake-container">
          <div className="stake-header">
            <h2 className="stake-title">Staking Packages</h2>
            <p className="stake-description">
              Choose a staking package to earn rewards. Each package offers
              different reward rates and durations.
            </p>
          </div>

          <div className="stake-grid">
            {packages.map((pkg) => (
              <div
                key={pkg._id}
                className={`stake-card ${pkg.isDisabled ? "disabled" : ""}`}
                onClick={() => {
                  if (!pkg.isDisabled) {
                    setSelectedPackage(pkg);
                    setShowDurationModal(true);
                  }
                }}
              >
                <div className="stake-card-header">
                  <div className="stake-card-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v6.5l5 3" />
                      <path d="M12 2v6.5l-5 3" />
                      <path d="M12 22V12" />
                      <path d="M9 14l3-2 3 2" />
                      <path d="M20 10l-8 5-8-5" />
                      <path d="M20 18l-8-5-8 5" />
                    </svg>
                  </div>
                  <h3 className="stake-card-title">{pkg.name}</h3>
                </div>

                <div className="stake-card-content">
                  <div className="stake-card-item">
                    <span className="stake-card-label">Reward Rate</span>
                    <span className="stake-card-value reward">
                      {pkg.reward}%
                    </span>
                  </div>
                  <div className="stake-card-item">
                    <span className="stake-card-label">Your Balance</span>
                    <span className="stake-card-value">
                      {formatNumber(tokenBalances[pkg.stakeTokenAddress])}
                    </span>
                  </div>
                  <div className="stake-card-item">
                    <span className="stake-card-label">Your Staked</span>
                    <span className="stake-card-value staked">
                      {formatNumber(stakedBalances[pkg.stakingAddress])}
                    </span>
                  </div>
                </div>

                <div className="stake-card-footer">
                  <button className="stake-card-button">
                    {pkg.isDisabled ? "Coming Soon" : "Select Package"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default StakeActions;
