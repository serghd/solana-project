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
   const securityAccount = "syvGxG53QvQFvDQhMavP68AgW6gWrYGjNiku7cduk6k";

   let securityTxt: String = "\
Contact: security@yourdomain.com\n\
Encryption: https://yourdomain.com/pgp-key.txt\n\
Acknowledgments: https://yourdomain.com/hall-of-fame.html\n\
Policy: https://yourdomain.com/security-policy.html\n\
Hiring: https://yourdomain.com/jobs.html";

   const txSig = await program.methods
      .updateSecurityTxt(securityTxt)
      .accounts({
         owner: provider.wallet.publicKey,
         securityAccount: new PublicKey(securityAccount),
         systemProgram: SystemProgram.programId,
      })
      .rpc();
   console.log(`Security Account pub-key: ${securityAccount}`);
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
