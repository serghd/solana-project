import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import idl from "../target/idl/program1.json";
import { Program1 } from "../target/types/program1";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const signer = provider.wallet.payer;
   if (!signer) return;

   const program = new Program<Program1>(idl, provider);

   //  1) via transaction
   //  const txSig = await program.methods
   //     .getValue()
   //     .accounts({ dataAccount: accountPubKey })
   //     .rpc();
   //  console.log("✅ Transaction Signature:", txSig);

   //  // Wait a bit for the transaction to finalize
   //  await new Promise((r) => setTimeout(r, 1000));

   //  const tx = await provider.connection.getTransaction(txSig, {
   //     commitment: "confirmed",
   //     maxSupportedTransactionVersion: 0,
   //  });

   //  console.log("🔍 On-chain logs:");
   //  console.log(tx?.meta?.logMessages?.join("\n") ?? "No logs found");

   // 2) read the value without a transaction

   // itemAccount:
   let itemAccountPubKey = "7ncDmk3iajdJftkHUwJ2k5VfMHyDzu5ZKGAz3SFnv1qA";
   const data = await program.account.itemAccount.fetch(itemAccountPubKey);
   console.log("Stored index:", data.index.toString());
   console.log("Stored value:", data.value.toString());

   // // securityAccount:
   // let securityAccountPubKey = "6nBoqRZkP8Nni5uTyVduyQ3fyQjEVSTAQa2yDvtZF8ER";
   // const data = await program.account.securityAccount.fetch(securityAccountPubKey);
   // console.log("Stored data:", data.data.toString());
   // console.log("Stored owner:", data.owner.toString());
}


main().catch((err) => {
   console.error(err);
   process.exit(1);
});
