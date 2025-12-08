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
   
   const [accountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("account-pda")],
      program2.programId,
   );

   const txSig = await program2.methods
      .createAccount()
      .accounts({
         signer: signer.publicKey,
         account: accountPda,
         systemProgram: SystemProgram.programId,
      })
      .signers([signer])
      .rpc();

   // localhost, last value: 7S8mQLUFHEgARionYY3XXim7Ndie92i3DBRcFSLnrdR2
   console.log(`Account PDA: ${accountPda.toBase58()}`);
   // localhost, last value: 2BxtrgYgY7rz93cA8khCdeDGDU6rJ4eX4sVBpmD6khVUvY7EowbXx1mwd2yW4dR4kSZeBAXPfJSMkHRw6QXK9Jhx
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
