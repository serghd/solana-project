import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import idl from "../target/idl/solana_project.json";
import { SystemProgram } from "@solana/web3.js";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);

   const program = new Program(idl, provider);
   const itemAccount = "7Qf1VJprbFUqfAR8t8otJSEmKAY85SkEvxBHa6N3X2tH";
   const txSig = await program.methods
      .resetValue()
      .accounts({
         owner: provider.wallet.publicKey,
         itemAccount,
         systemProgram: SystemProgram.programId,
      })
      .rpc();
   console.log(`Item Account: ${itemAccount}`);
   // localhost, last value: 4VE6xvX7641BHr7m2CNW2WdbMoavfZvQirHaZeMm71deM4nby7hQqHeLBxCgc5zkF5DCb7MwhEWhxZgqqwCgpCBP
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
