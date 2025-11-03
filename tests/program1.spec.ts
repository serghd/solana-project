import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Program1 } from "../target/types/program1";
import { Keypair, SystemProgram } from "@solana/web3.js";

describe("Program1", () => {
   anchor.setProvider(anchor.AnchorProvider.env());
   const program = anchor.workspace.program1 as Program<Program1>;
   const provider = anchor.getProvider();
   if (!provider.wallet) return;
   const signer = provider.wallet.payer;
   if (!signer) return;

   it("Initialize()", async () => {
      const dataAccount = Keypair.generate();
      await program.methods
         .initialize()
         .accounts({
            signer: signer.publicKey,
            dataAccount: dataAccount.publicKey,
            // @ts-ignore
            systemProgram: SystemProgram.programId,
         })
         .signers([signer, dataAccount])
         .rpc();
   });
});
