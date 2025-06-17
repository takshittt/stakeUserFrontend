"use client";

import { useEffect, useState } from "react";
import { ethers, BigNumber, utils } from "ethers";
import moment from "moment";
import { post } from "../lib/api";
import React from "react";
import "./TableComponent.css";

interface StakeInfo {
  amount: BigNumber;
  rewardDebt: BigNumber;
  lastClaimTime: BigNumber;
  accruedReward: BigNumber;
  totalClaimedReward: BigNumber;
  stakeTime: number;
  lockDuration: BigNumber;
  liveReward: BigNumber;
  claimed: boolean;
}

interface StakeWithRewardsInfo {
  amount: BigNumber;
  liveReward: BigNumber;
  pendingReward: BigNumber;
  claimedReward: BigNumber;
  stakeTime: number;
  lockDuration: number;
  claimed: boolean;
  fullyWithdrawn: boolean;
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

interface TableComponentProps {
  selectedPackage: Package | null;
  onBack: () => void;
}

const TableComponent: React.FC<TableComponentProps> = ({
  selectedPackage,
  onBack,
}) => {
  if (!selectedPackage)
    return <p className="text-white text-center">No package selected</p>;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(
    null
  );
  const [account, setAccount] = useState<string>("");
  const [stakes, setStakes] = useState<StakeInfo[]>([]);
  const [stakeWithRewards, setStakeWithRewards] = useState<
    StakeWithRewardsInfo[]
  >([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [allowance, setAllowance] = useState<BigNumber>(ethers.constants.Zero);
  const [tokenBalances, setTokenBalances] = useState("");
  const [claimedRewardIndex, setClaimedRewardIndex] = useState<string[]>([]);
  const isAllowed = allowance.gte(
    amount ? utils.parseEther(amount) : BigNumber.from(0)
  );
  const [lastClaimTimes, setLastClaimTimes] = React.useState<Date[]>([]);

  function parseError(error: any): string {
    if (
      error?.error?.data &&
      typeof error.error.data === "string" &&
      error.error.data.startsWith("0x08c379a0")
    ) {
      try {
        const reasonHex = "0x" + error.error.data.slice(10);
        const reason = ethers.utils.defaultAbiCoder.decode(
          ["string"],
          reasonHex
        );
        return reason[0];
      } catch {
        return "Transaction reverted (unable to decode reason)";
      }
    }
    return error?.message || "Transaction reverted";
  }

  const {
    stakeTokenAddress,
    stakingAddress,
    stakeTokenAddressAbi,
    stakingAddressAbi,
    name,
    reward,
    durationOptions,
  } = selectedPackage;

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return setStatus("Please install MetaMask");
      try {
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        const _signer = _provider.getSigner();
        const _account = await _signer.getAddress();
        const _contract = new ethers.Contract(
          stakingAddress,
          stakingAddressAbi,
          _signer
        );
        const _tokenContract = new ethers.Contract(
          stakeTokenAddress,
          stakeTokenAddressAbi,
          _signer
        );

        setProvider(_provider);
        setSigner(_signer);
        setAccount(_account);
        setContract(_contract);
        setTokenContract(_tokenContract);

        await loadStakesAndRewards(_contract, _account);
        await loadStakesAndRewardsResNew(_contract, _account);

        const _allowance = await _tokenContract.allowance(
          _account,
          stakingAddress
        );
        setAllowance(_allowance);

        const rawBalance: BigNumber = await _tokenContract.balanceOf(_account);
        const decimals: number = await _tokenContract.decimals();
        const formattedBalance = ethers.utils.formatUnits(rawBalance, decimals);
        setTokenBalances(formattedBalance);

        const getUserStakes: StakeWithRewardsInfo[] =
          await _contract.getUserStakeDetailsWithRewards(_account);
        setStakeWithRewards(getUserStakes);
        setStatus("");
      } catch (error) {
        console.error("❌ Error initializing staking setup:", error);
        setStatus("Wallet not connected");
      }
    };

    init();
    const interval = setInterval(init, 10000);
    return () => clearInterval(interval);
  }, [
    stakingAddress,
    stakingAddressAbi,
    stakeTokenAddress,
    stakeTokenAddressAbi,
  ]);

  const loadStakesAndRewards = async (
    contract: ethers.Contract,
    user: string
  ) => {
    try {
      const stakeData: StakeInfo[] =
        await contract.getUserStakeDetailsWithRewards(user);
      setStakes(stakeData);

      let newArr = [];
      for (let index = 0; index < stakeData.length; index++) {
        const stakeRes = await contract.stakes(account, index);
      }

      for (let i = 0; i < stakeData.length; i++) {
        const [reward] = await contract.getLiveReward(user, i);
        newArr.push(ethers.utils.formatEther(reward));
      }

      setClaimedRewardIndex(newArr);
    } catch {
      setStatus("Failed to fetch stake data");
    }
  };
  const loadStakesAndRewardsResNew = async (
    contract: ethers.Contract,
    user: string
  ) => {
    try {
      // 1. Get all stake data with rewards
      const stakeData: any[] = await contract.getUserStakeDetailsWithRewards(
        user
      );
      setStakes(stakeData);

      // 2. Get claim cooldown time in seconds
      // const claimCooldownBN: ethers.BigNumber = await contract.claimCooldown();
      // const claimCooldownSeconds = claimCooldownBN.toNumber();

      // 3. Fetch last claim times for each stake
      const stakeInfoPromises = stakeData.map((_: any, index: number) =>
        contract.stakes(user, index)
      );

      const stakeInfos = await Promise.all(stakeInfoPromises);

      const lastClaimTimesArr: Date[] = stakeInfos.map((info: any) => {
        const lastClaimTimestamp = info.lastClaimTime.toNumber();
        const claimableTime = moment
          .unix(lastClaimTimestamp)
          .add(43200, "minutes") // Correct unit
          .toDate();
        return claimableTime;
      });

      setLastClaimTimes(lastClaimTimesArr);
    } catch (error) {
      console.error("Error fetching stakes or claim times:", error);
      setStatus("Failed to fetch stake data");
    }
  };

  const handleApprove = async () => {
    if (!tokenContract || !amount)
      return setStatus("Enter amount to approve first");
    try {
      setApproving(true);
      setStatus("Approving...");
      const tx = await tokenContract.approve(
        stakingAddress,
        ethers.constants.MaxUint256
      );
      await tx.wait();
      const _allowance = await tokenContract.allowance(account, stakingAddress);
      setAllowance(_allowance);
      setStatus("Approved successfully!");
    } catch (error) {
      console.error("Approval error:", error);
      setStatus(`Approval failed: ${parseError(error)}`);
    } finally {
      setApproving(false);
    }
  };

  const handleStake = async () => {
    if (!contract || !amount || !duration)
      return setStatus("Enter amount and select duration");
    if (!isAllowed) return setStatus("Need to approve token spending first");

    try {
      setLoading(true);
      setStatus("Staking...");
      const wei = ethers.utils.parseEther(amount);
      const durationDays = parseInt(duration);
      console.log("Staking", wei.toString(), "wei for", durationDays, "days");

      const tx = await contract.stake(wei, durationDays);
      await tx.wait();
      setStatus("Staked successfully!");
      setAmount("");
      await loadStakesAndRewards(contract, account);
    } catch (error) {
      console.error("Staking error:", error);
      setStatus(`Staking failed: ${parseError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (index: number, amount: BigNumber) => {
    if (!contract) return;
    try {
      setLoading(true);
      setStatus(`Withdrawing stake #${index}...`);
      const tx = await contract.withdraw(index);
      await tx.wait();
      setStatus("Withdrawn successfully!");
      await loadStakesAndRewards(contract, account);
    } catch (error) {
      console.error("Withdrawal error:", error);
      setStatus(`Withdrawal failed: ${parseError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (index: number) => {
    if (!contract) return;
    try {
      setLoading(true);
      setStatus(`Claiming rewards for stake #${index}...`);
      const tx = await contract.claimReward(index);
      await tx.wait();
      setStatus("Rewards claimed successfully!");
      await loadStakesAndRewards(contract, account);
    } catch (error) {
      console.error("Claim error:", error);
      setStatus(`Claim failed: ${parseError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amt: BigNumber) => {
    if (!amt) return "0";
    const formatted = parseFloat(utils.formatEther(amt));
    return formatted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const formatResAmount = (amt: BigNumber) => {
    if (!amt) return "0";
    const formatted = parseFloat(utils.formatEther(amt));
    return formatted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  const formatNumber = (numStr?: string) => {
    const num = parseFloat(numStr || "0");
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 4,
    }).format(num);
  };

  // Pagination logic
  const indexOfLastStake = currentPage * itemsPerPage;
  const indexOfFirstStake = indexOfLastStake - itemsPerPage;
  const currentStakes = stakeWithRewards.slice(
    indexOfFirstStake,
    indexOfLastStake
  );
  const totalPages = Math.ceil(stakeWithRewards.length / itemsPerPage);

  function getDuration(lockDuration: number) {
    return lockDuration ? `${lockDuration} days` : "No lock";
  }

  function getUnlockDate(stakeTime: number, lockDuration: number) {
    if (!lockDuration) return "No lock";
    const unlockTime = moment.unix(stakeTime).add(lockDuration, "days");
    return unlockTime.format("MMM D, YYYY");
  }

  function unixTimestampToString(lastClaimTimestamp: any) {
    if (!lastClaimTimestamp) return "N/A";
    try {
      const date = new Date(lastClaimTimestamp);
      return date.toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  }

  return (
    <div className="table-container">
      <button onClick={onBack} className="back-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Packages
      </button>

      <div className="table-wrapper">
        <div className="table-header">
          <h2 className="stake-title">{name}</h2>
          <p className="stake-description">
            Stake tokens and earn {reward}% rewards
          </p>
        </div>

        <div className="table-balance-section">
          <p className="balance-info">
            Your balance:{" "}
            <span className="balance-value">{formatNumber(tokenBalances)}</span>
          </p>
          {status && (
            <div
              className={`status-message ${
                status.includes("failed") || status.includes("error")
                  ? "status-error"
                  : "status-success"
              }`}
            >
              {status}
            </div>
          )}
        </div>

        <div className="input-grid">
          <div className="input-group">
            <label className="input-label">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount to stake"
              disabled={loading || approving}
              step="0.000001"
              min="0"
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Duration (days)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={loading || approving}
              className="input-field"
            >
              <option value="">Select duration</option>
              {durationOptions.map((d) => (
                <option key={d} value={d}>
                  {d} days
                </option>
              ))}
            </select>
          </div>
          <div className="button-group">
            {!isAllowed ? (
              <button
                onClick={handleApprove}
                disabled={approving || !amount || loading}
                className="action-button claim-button"
              >
                {approving ? (
                  <>
                    <svg
                      className="loading-spinner"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="spinner-circle"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="spinner-path"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Approving...
                  </>
                ) : (
                  "Approve"
                )}
              </button>
            ) : (
              <button
                onClick={handleStake}
                disabled={loading || !amount || !duration}
                className="action-button claim-button"
              >
                {loading ? (
                  <>
                    <svg
                      className="loading-spinner"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="spinner-circle"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="spinner-path"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Staking...
                  </>
                ) : (
                  "Stake"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <h3 className="stake-subtitle">Your Stakes</h3>

        {stakeWithRewards.length === 0 ? (
          <p className="no-data">You don't have any active stakes yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Duration</th>
                  <th>Unlock Date</th>
                  <th>Pending Rewards</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stakeWithRewards
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((stake, index) => {
                    const actualIndex =
                      (currentPage - 1) * itemsPerPage + index;
                    const isUnlocked =
                      stake.stakeTime +
                        Number(stake.lockDuration) * 24 * 60 * 60 <
                      Math.floor(Date.now() / 1000);
                    return (
                      <tr key={index}>
                        <td>{actualIndex}</td>
                        <td className="amount-cell">
                          {formatAmount(stake.amount)}
                        </td>
                        <td>{getDuration(Number(stake.lockDuration))}</td>
                        <td className="date-cell">
                          {getUnlockDate(
                            Number(stake.stakeTime),
                            Number(stake.lockDuration)
                          )}
                        </td>
                        <td className="reward-cell">
                          {formatResAmount(stake.pendingReward)}
                        </td>
                        <td>
                          {!stake.claimed && (
                            <button
                              onClick={() => handleClaimReward(actualIndex)}
                              disabled={loading}
                              className="action-button claim-button"
                            >
                              Claim
                            </button>
                          )}
                          {isUnlocked && !stake.fullyWithdrawn && (
                            <button
                              onClick={() =>
                                handleWithdraw(actualIndex, stake.amount)
                              }
                              disabled={loading}
                              className="action-button withdraw-button"
                            >
                              Withdraw
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {stakeWithRewards.length > itemsPerPage && (
          <div className="pagination">
            {Array.from(
              {
                length: Math.ceil(stakeWithRewards.length / itemsPerPage),
              },
              (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`pagination-button ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                >
                  {i + 1}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableComponent;
