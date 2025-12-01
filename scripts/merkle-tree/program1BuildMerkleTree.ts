import fs from "fs";
import keccak256 from "keccak256";
import { defaultAbiCoder } from "@ethersproject/abi";
import { MerkleTree } from "merkletreejs";
import { utils } from "../../misc/utils";
import { LeafPayload } from "../../misc/types";

const csvFile = "./res/merkle-data/source/epoch_12.csv";
const outputFile = "./res/merkle-data/generated/proofs_epoch12.json";

async function main() {
   const leafsRaw = await utils.loadLeafsFromCSV(csvFile);
   const types = [
      "uint256",
      "uint256",
      "string",
      "string",
      "uint256",
      "string",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "string",
   ];

   const leafs = leafsRaw.map((l) =>
      keccak256(
         defaultAbiCoder.encode(types, [
            l.version,
            l.epoch_id,
            l.event_id,
            l.user_pubkey,
            l.amount_user,
            l.referrer_pubkey,
            l.amount_ref,
            l.amount_vip,
            l.expire_at_unix,
            l.partner_id,
            l.tracking_tag,
         ]),
      ),
   );

   const tree = new MerkleTree(leafs, keccak256, { sortPairs: true });

   /********** CHECK LEAF[0] ************/

   const leaf = leafs[0];
   const proof = tree.getProof(leaf);

   console.log("Merkle Root:", tree.getRoot().toString("hex"));
   console.log("Leaf 0:", leaf.toString("hex"));
   console.log(
      "Proof of Leaf 0:",
      proof.map((p) => p.data.toString("hex")),
   );

   const isValid = tree.verify(proof, leaf, tree.getRoot());
   console.log("Proof valid?", isValid);

   /***** SAVE THE TREE TO THE FILE *****/

   const leafsWithProofs: LeafPayload[] = leafsRaw.map(
      (leaf: LeafPayload, idx: number): LeafPayload => {
         const leafHash = leafs[idx].toString("hex");
         const proof = tree.getProof(leafs[idx]).map((p) => p.data.toString("hex"));
         return {
            ...leaf,
            index: idx,
            hash: leafHash,
            proof,
         };
      },
   );

   const outputData = {
      root: tree.getRoot().toString("hex"),
      leafs: leafsWithProofs,
   };

   fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
   console.log(`✅ Merkle tree and proofs saved to ${outputFile}`);
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
