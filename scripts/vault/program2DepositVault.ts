import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import idl from "../../target/idl/program2.json";
import { PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   const program2 = new Program(idl, provider);
   
   const amount: number = 10;
   const vaultPda = new PublicKey("DqUND9Jwu6CVLkciDZ2JTHYchD3QXoKVsChhyLPjZdpT");

   const txSig = await program2.methods
      .createVault(new anchor.BN(amount))
      .accounts({
         signer: signer.publicKey,
         vaultPda
      })
      .signers([signer])
      .rpc();

   // localhost, last value: 4kAm17s3ud4J1gK26V3YqFC1eJ27g976Ecp1wFZwuC1cvTGLKR9HixEDqWQ5GahzZRd1vYqcUPTXbuW3eJbB5Crd
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
