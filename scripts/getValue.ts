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
   let accountPubKey = "syvGxG53QvQFvDQhMavP68AgW6gWrYGjNiku7cduk6k";

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
   // const data = await program.account.itemAccount.fetch(accountPubKey);
   // console.log("Stored index:", data.index.toString());
   // console.log("Stored value:", data.value.toString());
   // console.log("Stored owner's pubKey:", data.owner.toString());
   // securityAccount:
   const data = await program.account.securityAccount.fetch(accountPubKey);
   console.log("Stored data:", data.data.toString());
   console.log("Stored owner's pubKey:", data.owner.toString());
}


main().catch((err) => {
   console.error(err);
   process.exit(1);
});
