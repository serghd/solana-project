import * as anchor from "@coral-xyz/anchor";
import idl from "../target/idl/program1.json";
import { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";
import { utils } from "../misc/utils";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const program = new anchor.Program(idl, provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   // // create new ATA
   // const mint = new PublicKey(process.env.BAM_TOKEN_MINT as string);
   // const acc = Keypair.generate();
   // const ata = await getOrCreateAssociatedTokenAccount(provider.connection, signer, mint, acc.publicKey);
   // console.log("✅ ATA:", ata);

   const from = new PublicKey(process.env.OWNER_ATA as string);
   const to = new PublicKey("GCzdxYntjzcAxjTykr7J6aAMmA4LmxwYB3ikcWkoxcz8"); // ATA

   const tx = await program.methods
      .transferTokens(utils.toTokenAmount(1, 9))
      .accounts({
         signer: signer.publicKey,
         from,
         to,
         tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([signer])
      .rpc();
   console.log("✅ Transaction Signature:", tx);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
