import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import idl from "../target/idl/program1.json";
import { Keypair, SystemProgram } from "@solana/web3.js";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   const program = new Program(idl, provider);
   const dataAccount = "F2Wdo5xYgoJJhdr9EUK3uw8aZi1WPxoBAiLYzsxe59bL";
   const itemAccount = Keypair.generate();

   const txSig = await program.methods
      .addValue(new anchor.BN(100500))
      .accounts({
         signer: signer.publicKey,
         dataAccount,
         itemAccount: itemAccount.publicKey,
         systemProgram: SystemProgram.programId,
      })
      .signers([signer, itemAccount])
      .rpc();

   // localhost, last_value: 7ncDmk3iajdJftkHUwJ2k5VfMHyDzu5ZKGAz3SFnv1qA
   console.log(`Item Account: ${itemAccount.publicKey.toBase58()}`);
   // localhost, last value: VcmGUETSpU3j1EdsFuiaMCZ9qHXAnttgj3MR6xAugFQAaPzhSCd6aCCDWDRQJEk6wDUuo3eEsbfm9mFAU4NGcwP
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
