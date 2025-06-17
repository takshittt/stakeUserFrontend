import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { STAKING_CONTRACT_ABI } from "./stakingContractAbi";


const stakeAddress = '0x86D54a777D70EE745D07Cc85C74d989bC7223d07';
const stakeTokenAddress = '0xA31fb7667F80306690F5DF0d9A6ea272aBF97926';
const rewardTokenAddress = '0x36E4e26aa6242EF41EFa40B97eb7Fe8b70c5308E';


// // const stakeAddress = '0x80f2641658f6357bf9E842A428A0aF79BcA77AbF';
// const stakeAddress = '0xd052B852bC359611348d7167664ffDBE0cABD4b7';
// const stakeTokenAddress = '0xaC0ca2548e8131D20cBa89CCe33Ec7C74272F61E';
// const rewardTokenAddress = '0x534c1A8F7A15b374e0D306c08E43c5A66571619b';

export const STAKE_CONTRACT_ADDRESS = getContract({
    client: client,
    chain: chain,
    address: stakeTokenAddress
})
export const REWARD_CONTRACT_ADDRESS = getContract({
    client: client,
    chain: chain,
    address: rewardTokenAddress
})
export const STAKE_CONTRACT = getContract({
    client: client,
    chain: chain,
    address: stakeAddress,
    abi: STAKING_CONTRACT_ABI,
})  