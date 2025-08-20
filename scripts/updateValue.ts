import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import idl from "../target/idl/solana_project.json";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);

   const program = new Program(idl, provider);
   const itemAccount = "7Qf1VJprbFUqfAR8t8otJSEmKAY85SkEvxBHa6N3X2tH";
   const txSig = await program.methods
      .updateValue(new anchor.BN(100600))
      .accounts({
         owner: provider.wallet.publicKey,
         itemAccount,
         systemProgram: SystemProgram.programId,
      })
      .rpc();
   console.log(`Item Account: ${itemAccount}`);
   // localhost, last value: 3WEF4ea7NSdfhhUrjVzBfKtBdDob6PhXsbhKmo3w1n2E9TfvynfmudXJHsyt9SESVxcGSnd5a4jAaKKgUm75ymaX
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
