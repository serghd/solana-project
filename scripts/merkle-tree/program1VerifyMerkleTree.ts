import * as dotenv from "dotenv";
import * as anchor from "@coral-xyz/anchor";
import idlProgram1 from "../../target/idl/program1.json";
import { PublicKey } from "@solana/web3.js";
import { utils } from "../../misc/utils";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const program1 = new anchor.Program(idlProgram1, provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   const leafPayload = {
      version: 1,
      epochId: new anchor.BN(12),
      eventId: "key-20-order-0001",
      userPubkey: "FZaf3F5Gt8z9CWepVodfPr1P7HwpKPdNTPKm2trmLaGj",
      amountUser: new anchor.BN(500000),
      referrerPubkey: "2YGSxPWkxan1KvNJreer33AFErwpRLhL55Fvka1mpgdb",
      amountRef: new anchor.BN(200000),
      amountVip: new anchor.BN(100000),
      expireAtUnix: new anchor.BN(1760000000),
      partnerId: new anchor.BN(1),
      trackingTag: "key-20",
   };

   // without "0x"
   const proof: Array<Buffer> = [
      Buffer.from("163330900337d92a01042f750dedd33ebbe9110672f74da9913d14da367d263b", "hex"),
   ];
   const index = Number(1);
   const epochPda = new PublicKey("ApLL2U4zntPRHoSQv5gb4ekvtH5MN5Dxhuyz6teC4Nnv");
   const bitmapPda = new PublicKey("EqMotXAkb8umfnQtMNPvAwL5MrXrdbfYY1phwjqevfDV");

   const tx = await program1.methods
      .verifyMerkleTree(leafPayload, proof, index)
      .accounts({
         signer: signer.publicKey,
         epochPda,
         bitmapPda,
         systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([signer])
      .rpc();
   utils.logAligned("✅ 'claim' signature:", tx);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
