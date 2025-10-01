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
      [Buffer.from("security_txt_2")],
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
   
   // localhost, last_value: ESD6ekSwCe6K2qw7a4Qk7AZtG8qPNGC5bzvh4rjkq8zi
   console.log(`Data Account Owner: ${dataAccount.publicKey.toBase58()}`);
   // localhost, last value: 6nBoqRZkP8Nni5uTyVduyQ3fyQjEVSTAQa2yDvtZF8ER
   console.log(`Security Account Owner: ${securityPda.toBase58()}`);
   // localhost, last value: 42hs8ZcfjVV8dgnApvXsk9gHCvj4osijEPnyowEiaa8X4TJd97ekSzWhtcpVaamuVa6VxT5f3uc7tsEAaiU5EjQ5
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
