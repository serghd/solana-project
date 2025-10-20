import { BN } from "bn.js";

export const toTokenAmount = (amount: number, decimals: number) =>
   new BN(amount).mul(new BN(10).pow(new BN(decimals)));

function logAligned(label: string, value: any, width = 38) {
   console.log(label.padEnd(width), value);
}

export const utils = {
   toTokenAmount,
   logAligned
};