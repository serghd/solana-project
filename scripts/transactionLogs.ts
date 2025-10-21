import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider } from "@coral-xyz/anchor";
import { TransactionSignature, GetVersionedTransactionConfig } from "@solana/web3.js";

import * as dotenv from "dotenv";

dotenv.config();

async function printTxLogs(provider: AnchorProvider, txSignature: TransactionSignature) {
   const config: GetVersionedTransactionConfig = {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
   };

   const txInfo = await provider.connection.getTransaction(txSignature, config);

   console.log("=== Logs from transaction ===");
   if (txInfo?.meta?.logMessages) {
      txInfo.meta.logMessages.forEach((log) => console.log(log));
   } else {
      console.log("No logs found for this transaction.");
   }
}

async function main() {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   await printTxLogs(
      provider,
      "Ze1eGjUiomFuNgDytrFcXbCDG91URzrxze7tGpgqb3ehS6sZMmE8FUmfrtTw2vWBinYvYeQQ4gohEvRbi6DHcGM",
   );
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
