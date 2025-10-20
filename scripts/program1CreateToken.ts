import * as dotenv from "dotenv";
import * as anchor from "@coral-xyz/anchor";
import idl from "../target/idl/program1.json";
import {
   createMint,
   TOKEN_PROGRAM_ID,
   ASSOCIATED_TOKEN_PROGRAM_ID,
   getAssociatedTokenAddress,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { utils } from "../misc/utils";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const program = new anchor.Program(idl, provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   // create Mint
   const decimals = 9;
   const mint = await createMint(
      provider.connection,
      signer,
      signer.publicKey,
      signer.publicKey,
      decimals,
   );
   utils.logAligned("Token:", `MINT: ${mint.toBase58()}, Authority: ${signer.publicKey}`, 23);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
