import * as anchor from "@coral-xyz/anchor";
import idl from "../target/idl/program2.json";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";
import { utils } from "../misc/utils";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const program = new anchor.Program(idl, provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   const fromAta = new PublicKey(process.env.OWNER_ATA as string);
   const toAta = new PublicKey("C2ehWA83EEffs1gbUYnvPVarUuai23k6ZAH1yQ5Y7KAT");
   const program1 = new PublicKey("KBCe2H8VpgPh44QPURqj5uiywx93CG3j1rGtBY3TXLY");

   const tx = await program.methods
      .callTransfer(utils.toTokenAmount(1, 9))
      .accounts({
         signer: signer.publicKey,
         from: fromAta,
         to: toAta,
         program1_program: program1,
         tokenProgram: TOKEN_PROGRAM_ID
      })
      .signers([signer])
      .rpc();
   console.log("✅ Transaction Signature:", tx);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});