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
   const dataAccount = "ESD6ekSwCe6K2qw7a4Qk7AZtG8qPNGC5bzvh4rjkq8zi";
   const itemAccount = Keypair.generate();

   // PDA:
   // const [itemPda] = await PublicKey.findProgramAddress(
   // [
   //    Buffer.from("item"),
   //    dataAccount.publicKey.toBuffer(),
   //    new BN(index).toArrayLike(Buffer, "le", 8),
   // ],program.programId);

   const txSig = await program.methods
      .addValue(new anchor.BN(100500))
      .accounts({
         owner: provider.wallet.publicKey,
         dataAccount,
         itemAccount: itemAccount.publicKey,
         systemProgram: SystemProgram.programId,
      })
      .signers([itemAccount])
      .rpc();

   // localhost, last_value: 7Qf1VJprbFUqfAR8t8otJSEmKAY85SkEvxBHa6N3X2tH
   console.log(`Item Account: ${itemAccount.publicKey.toBase58()}`);
   // localhost, last value: 4Mm7t15YkTGjwewk1mc8BurVpRtu35wptg2jKg5hGPFS1BW3MEDJARHPtJbd4BVggyfxBFQ5C4n4Pf8zfKTkoExd
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
