use anchor_lang::prelude::*;
use ethabi::{encode, Token};
use sha3::{Digest, Keccak256};

#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone)]
pub struct LeafPayload {
   pub version: u8,
   pub epoch_id: u64,
   pub event_id: String,
   pub user_pubkey: String,
   pub amount_user: u64,
   pub referrer_pubkey: String,
   pub amount_ref: u64,
   pub amount_vip: u64,
   pub expire_at_unix: u64,
   pub partner_id: u64,
   pub tracking_tag: String,
}

pub fn hash_leaf(leaf: &LeafPayload) -> [u8; 32] {
   let tokens = vec![
      Token::Uint(leaf.version.into()),
      Token::Uint(leaf.epoch_id.into()),
      Token::String(leaf.event_id.clone()),
      Token::String(leaf.user_pubkey.clone()),
      Token::Uint(leaf.amount_user.into()),
      Token::String(leaf.referrer_pubkey.clone()),
      Token::Uint(leaf.amount_ref.into()),
      Token::Uint(leaf.amount_vip.into()),
      Token::Uint(leaf.expire_at_unix.into()),
      Token::Uint(leaf.partner_id.into()),
      Token::String(leaf.tracking_tag.clone()),
   ];

   let encoded = encode(&tokens);
   let hash = Keccak256::digest(&encoded);

   hash.into()
}

fn hash_concat_sorted(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
   let (first, second) = if a <= b { (a, b) } else { (b, a) };
   let mut hasher = Keccak256::new();
   hasher.update(first);
   hasher.update(second);
   hasher.finalize().into()
}

pub fn verify_merkle(leaf: [u8; 32], proof: &[[u8; 32]], root: [u8; 32]) -> bool {
   let mut h = leaf;
   for sib in proof.iter() {
      h = hash_concat_sorted(&h, sib);
   }
   h == root
}
