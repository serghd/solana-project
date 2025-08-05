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
   const dataAccount = Keypair.generate();
   const [securityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("security_txt")],
      program.programId
   );

   const txSig = await program.methods
      .initialize()
      .accounts({
         owner: provider.wallet.publicKey,
         dataAccount: dataAccount.publicKey,
         securityAccount: securityPda,
         systemProgram: SystemProgram.programId,
      })
      .signers([dataAccount])
      .rpc();
   console.log(`Data Account Owner pub-key: ${dataAccount.publicKey.toBase58()}`);
   console.log(`Security Account Owner pub-key: ${securityPda.toBase58()}`);
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
