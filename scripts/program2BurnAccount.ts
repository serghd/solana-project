import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import idlProgram2 from "../target/idl/program2.json";
import { PublicKey, SystemProgram } from "@solana/web3.js";

import * as dotenv from "dotenv";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   const program2 = new Program(idlProgram2, provider);
   const accountPda = new PublicKey("7S8mQLUFHEgARionYY3XXim7Ndie92i3DBRcFSLnrdR2");

   const txSig = await program2.methods
      .burnAccount()
      .accounts({
         signer: signer.publicKey,
         accountPda,
         systemProgram: SystemProgram.programId,
      })
      .signers([signer])
      .rpc();

   // localhost, last value: VcmGUETSpU3j1EdsFuiaMCZ9qHXAnttgj3MR6xAugFQAaPzhSCd6aCCDWDRQJEk6wDUuo3eEsbfm9mFAU4NGcwP
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
