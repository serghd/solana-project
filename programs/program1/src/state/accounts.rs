use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct EpochAccount {
   pub epoch_id: u64,
   #[max_len(32)]
   pub merkle_root: Vec<u8>,
   pub authority: Pubkey,
   pub bump: u8,
}

#[account]
pub struct BitmapAccount {
   pub bits: Vec<u8>,
}
