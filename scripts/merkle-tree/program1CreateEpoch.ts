import * as dotenv from "dotenv";
import * as anchor from "@coral-xyz/anchor";
import idlProgram1 from "../../target/idl/program1.json";
import { PublicKey } from "@solana/web3.js";
import { utils } from "../../misc/utils";
import { BN } from "bn.js";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const program1 = new anchor.Program(idlProgram1, provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   const epochId = new anchor.BN(12);

   const merkleRoot = Buffer.from(
      "a22dd6178ae99e60dbf50f02f79d6a5797f1d4d8ce47b2334e90e0726c54c696",
      "hex",
   );

   const bitmapSize = new BN(1000);

   const [epochPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("epoch"), utils.u64ToBufferLE(epochId)],
      program1.programId,
   );

   const [bitmapPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bitmap"), epochPda.toBuffer()],
      program1.programId,
   );

   {
      const tx = await program1.methods
         .createEpoch(epochId, bitmapSize, merkleRoot)
         .accounts({
            signer: signer.publicKey,
            epochPda,
            bitmapPda,
            systemProgram: anchor.web3.SystemProgram.programId,
         })
         .signers([signer])
         .rpc();
      utils.logAligned("✅ 'createEpoch' signature:", tx);
   }

   utils.logAligned("✅ Epoch PDA:", epochPda.toBase58(), 26);
   utils.logAligned("✅ Bitmap PDA:", bitmapPda.toBase58(), 26);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
