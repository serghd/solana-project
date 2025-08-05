import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaProject } from "../target/types/solana_project";

describe("solana-project", () => {
   // Configure the client to use the local cluster.
   anchor.setProvider(anchor.AnchorProvider.env());

   const program = anchor.workspace.solanaProject as Program<SolanaProject>;

   it("Get greetings!", async () => {
      // Add your test here.
      const tx = await program.methods.getGreetings().rpc();
      console.log("Your transaction signature", tx);
   });
});
