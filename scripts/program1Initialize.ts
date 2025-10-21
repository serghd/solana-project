import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import idl from "../target/idl/program1.json";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   const program = new Program(idl, provider);
   const dataAccount = Keypair.generate();

   const txSig = await program.methods
      .initialize()
      .accounts({
         signer: signer.publicKey,
         dataAccount: dataAccount.publicKey,
         systemProgram: SystemProgram.programId,
      })
      .signers([signer, dataAccount])
      .rpc();

   // localhost, last_value: F2Wdo5xYgoJJhdr9EUK3uw8aZi1WPxoBAiLYzsxe59bL
   console.log(`Data Account Owner: ${dataAccount.publicKey.toBase58()}`);
   // localhost, last value: 4vcAjDKCAHwH7SVSkAerbihJxYRRttM7fLuP42FVFyiQ6W3d72hcjJT1kdJuL4m9TbJDckHXct1uX8YJdjBXZQ1i
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
