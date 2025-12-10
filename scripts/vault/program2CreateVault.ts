import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import idl from "../../target/idl/program2.json";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   const program2 = new Program(idl, provider);

   const time: number = new Date().getTime() + 1;

   const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), signer.publicKey.toBuffer()],
      program2.programId
   );

   const txSig = await program2.methods
      .createVault(new anchor.BN(time))
      .accounts({
         signer: signer.publicKey,
         vaultPda,
         systemProgram: SystemProgram.programId,
      })
      .signers([signer])
      .rpc();

   // localhost, last_value: DqUND9Jwu6CVLkciDZ2JTHYchD3QXoKVsChhyLPjZdpT
   console.log(`Vault: ${vaultPda.toBase58()}`);
   // localhost, last value: 37xrnE8MQ8AwW48zS2YBa7SQP1WS5TjttQ6Bfo6Xc5yEkxkWtCpm5sQs75wUMoYV4VQ8ykBZzJR3oGyXDHwrqEyo
   console.log("✅ Transaction Signature:", txSig);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
