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
   const dataAccount = "AT57fECDNDe4XD9UW8rEjKdwG3z1NREhjsK5meHt8ZXh";
   const itemAccount = Keypair.generate();

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
   console.log(`Item Account pub-key: ${itemAccount.publicKey.toBase58()}`);
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
