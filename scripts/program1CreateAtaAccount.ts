import * as dotenv from "dotenv";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { utils } from "../misc/utils";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   const mint = new PublicKey(process.env.BAM_TOKEN_MINT as string);
   const acc = new PublicKey(signer.publicKey);
   const ata = await getOrCreateAssociatedTokenAccount(provider.connection, signer, mint, acc);
   console.log("✅ ATA created:", ata);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
