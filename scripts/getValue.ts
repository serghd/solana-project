import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import idl from "../target/idl/solana_project.json";
import { SolanaProject } from "../target/types/solana_project";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);

   const program = new Program<SolanaProject>(idl, provider);
   
   // security txt account
   let securityAccountPubKey = "6nBoqRZkP8Nni5uTyVduyQ3fyQjEVSTAQa2yDvtZF8ER";

   // // item account
   // let itemAccountPubKey = "7Qf1VJprbFUqfAR8t8otJSEmKAY85SkEvxBHa6N3X2tH";

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
   
   // // itemAccount:
   // const data = await program.account.itemAccount.fetch(itemAccountPubKey);
   // console.log("Stored index:", data.index.toString());
   // console.log("Stored value:", data.value.toString());
   // console.log("Stored owner:", data.owner.toString());
   
   // securityAccount:
   const data = await program.account.securityAccount.fetch(securityAccountPubKey);
   console.log("Stored data:", data.data.toString());
   console.log("Stored owner:", data.owner.toString());
}


main().catch((err) => {
   console.error(err);
   process.exit(1);
});
