import { BN } from "bn.js";
import { LeafPayload } from "./types";
import fs from "fs";
import { parse } from "csv-parse";
import * as anchor from "@coral-xyz/anchor";

export const toTokenAmount = (amount: number, decimals: number) =>
   new BN(amount).mul(new BN(10).pow(new BN(decimals)));

function logAligned(label: string, value: any, width = 38) {
   console.log(label.padEnd(width), value);
}

function u64ToBufferLE(n: number | anchor.BN): Buffer {
   const buf = Buffer.alloc(8);
   const bigIntValue = BN.isBN(n) ? BigInt(n.toString()) : BigInt(n);
   buf.writeBigUInt64LE(bigIntValue);
   return buf;
}

async function loadLeafsFromCSV(csvFile: string): Promise<LeafPayload[]> {
   return new Promise((resolve, reject) => {
      const results: LeafPayload[] = [];
      fs.createReadStream(csvFile)
         .pipe(parse({ columns: true, trim: true }))
         .on("data", (row) => {
            results.push({
               version: Number(row.version),
               epoch_id: Number(row.epoch_id),
               event_id: row.event_id,
               user_pubkey: row.user_pubkey,
               amount_user: Number(row.amount_user),
               referrer_pubkey: row.referrer_pubkey,
               amount_ref: Number(row.amount_ref),
               amount_vip: Number(row.amount_vip),
               expire_at_unix: Number(row.expire_at_unix),
               partner_id: Number(row.partner_id),
               tracking_tag: row.tracking_tag,
            });
         })
         .on("end", () => resolve(results))
         .on("error", (err) => reject(err));
   });
}

export const utils = {
   toTokenAmount,
   logAligned,
   loadLeafsFromCSV,
   u64ToBufferLE
};
