import * as dotenv from "dotenv";
import * as anchor from "@coral-xyz/anchor";
import idl from "../target/idl/program1.json";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { utils } from "../misc/utils";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const program = new anchor.Program(idl, provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   const mint = new PublicKey(process.env.BAM_TOKEN_MINT as string);
   const toAta = new PublicKey(process.env.OWNER_ATA as string);
   {
      const tx = await program.methods
         .mintTokens(utils.toTokenAmount(1000_000_000, 9))
         .accounts({
            signer: signer.publicKey,
            mint,
            to: toAta,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
         })
         .signers([signer])
         .rpc();
      utils.logAligned("✅ 'mintTokens' signature:", tx);
   }

   utils.logAligned("Mint to:", `ATA: ${toAta.toBase58()}, Authority: ${signer.publicKey}`, 23);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
