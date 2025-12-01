use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

mod state;

use state::accounts::{BitmapAccount, EpochAccount};
use state::leaf_payload::{hash_leaf, verify_merkle, LeafPayload};

#[allow(unused_imports)]
use security_info::security_txt;

declare_id!("KBCe2H8VpgPh44QPURqj5uiywx93CG3j1rGtBY3TXLY");

#[program]
pub mod program1 {
   use super::*;

   pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
      require_keys_eq!(ctx.accounts.signer.key(), OWNER_WALLET, ErrorCode::Unauthorized);

      let data_account = &mut ctx.accounts.data_account;
      data_account.counter = 0u64;

      msg!("Data account created: {}", data_account.key().to_string());
      Ok(())
   }

   pub fn add_value(ctx: Context<AddValue>, value: u64) -> Result<()> {
      require_keys_eq!(ctx.accounts.signer.key(), OWNER_WALLET, ErrorCode::Unauthorized);

      let data = &mut ctx.accounts.data_account;
      let item = &mut ctx.accounts.item_account;

      item.index = data.counter;
      item.value = value;

      data.counter += 1;

      msg!("Value has been added. Value {}", value.to_string());
      Ok(())
   }

   pub fn get_value(ctx: Context<GetValue>) -> Result<()> {
      let item = &ctx.accounts.item_account;
      msg!("Stored index is {}. Value is: {}", item.index, item.value);
      Ok(())
   }

   pub fn update_value(ctx: Context<UpdateValue>, value: u64) -> Result<()> {
      require_keys_eq!(ctx.accounts.signer.key(), OWNER_WALLET, ErrorCode::Unauthorized);

      let item = &mut ctx.accounts.item_account;
      item.value = value;

      msg!("Value has been update. New value {}", item.value.to_string());
      Ok(())
   }

   pub fn mint_tokens(ctx: Context<MintToken>, total_supply: u64) -> Result<()> {
      require_keys_eq!(ctx.accounts.signer.key(), OWNER_WALLET, ErrorCode::Unauthorized);

      let mint = &ctx.accounts.mint;
      let token_program = &ctx.accounts.token_program;

      // mint all tokens to Token Owner
      let cpi_token = CpiContext::new(
         token_program.to_account_info(),
         token::MintTo {
            mint: mint.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
         },
      );
      token::mint_to(cpi_token, total_supply)?;

      Ok(())
   }

   pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
      require_keys_eq!(ctx.accounts.signer.key(), OWNER_WALLET, ErrorCode::Unauthorized);

      let cpi_accounts = Transfer {
         from: ctx.accounts.from.to_account_info(),
         to: ctx.accounts.to.to_account_info(),
         authority: ctx.accounts.signer.to_account_info(),
      };
      let cpi_program = ctx.accounts.token_program.to_account_info();
      let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

      token::transfer(cpi_ctx, amount)?;
      Ok(())
   }

   pub fn create_epoch(
      ctx: Context<CreateEpoch>,
      epoch_id: u64,
      bitmap_size: u64,
      merkle_root: Vec<u8>,
   ) -> Result<()> {
      require_keys_eq!(ctx.accounts.signer.key(), OWNER_WALLET, ErrorCode::Unauthorized);

      let epoch = &mut ctx.accounts.epoch_pda;
      epoch.epoch_id = epoch_id;
      epoch.merkle_root = merkle_root;
      epoch.authority = ctx.accounts.signer.key();
      epoch.bump = ctx.bumps.epoch_pda;

      let bitmap = &mut ctx.accounts.bitmap_pda;
      bitmap.bits = vec![0u8; bitmap_size as usize];

      Ok(())
   }

   pub fn verify_merkle_tree(
      ctx: Context<VerifyMerkleTree>,
      payload: LeafPayload,
      proof: Vec<[u8; 32]>,
      _index: u32,
   ) -> Result<()> {
      let epoch = &ctx.accounts.epoch_pda;

      let merkle_root: [u8; 32] =
         epoch.merkle_root.as_slice().try_into().expect("Merkle root must be 32 bytes");
      let leaf = hash_leaf(&payload);

      // DEBUG: -----------------------
      //msg!("!!!!!!!!! root: {}", hex::encode(merkle_root));
      //msg!("!!!!!!!!! leaf: {}", hex::encode(leaf));
      // for (i, sib) in proof.iter().enumerate() {
      //    msg!("!!!!!!!!! proof[{}]: {}", i, hex::encode(sib));
      // }

      // let verified = verify_merkle(leaf, &proof, merkle_root);
      // msg!("!!!!! verify_merkle result: {}", verified);
      // ------------------------------

      require!(verify_merkle(leaf, &proof, merkle_root), ErrorCode::InvalidProof);

      Ok(())
   }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
   #[account(mut)]
   pub signer: Signer<'info>,

   #[account(
      init,
      payer = signer,
      space = 8 + DataAccount::INIT_SPACE
   )]
   pub data_account: Account<'info, DataAccount>,

   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddValue<'info> {
   #[account(mut)]
   pub signer: Signer<'info>,

   #[account(mut)]
   pub data_account: Account<'info, DataAccount>,

   #[account(
        init,
        payer = signer,
        space = 8 + ItemAccount::INIT_SPACE
    )]
   pub item_account: Account<'info, ItemAccount>,

   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetValue<'info> {
   pub item_account: Account<'info, ItemAccount>,
}

#[derive(Accounts)]
pub struct UpdateValue<'info> {
   #[account(mut)]
   pub signer: Signer<'info>,

   #[account(mut)]
   pub item_account: Account<'info, ItemAccount>,

   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintToken<'info> {
   #[account(mut)]
   pub signer: Signer<'info>,

   #[account(mut)]
   pub mint: Account<'info, Mint>,

   #[account(mut)]
   pub to: Account<'info, TokenAccount>,

   pub token_program: Program<'info, Token>,
   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
   #[account(mut)]
   pub signer: Signer<'info>,

   #[account(mut)]
   pub from: Account<'info, TokenAccount>,

   #[account(mut)]
   pub to: Account<'info, TokenAccount>,

   pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(epoch_id: u64, bitmap_size: u64, amount_to_liquidity: u64)]
pub struct CreateEpoch<'info> {
   #[account(mut)]
   pub signer: Signer<'info>,

   #[account(
        init_if_needed,
        payer = signer,
        space = 8 + EpochAccount::INIT_SPACE,
        seeds = [b"epoch", epoch_id.to_le_bytes().as_ref()],
        bump
    )]
   pub epoch_pda: Account<'info, EpochAccount>,

   #[account(
        init_if_needed,
        payer = signer,
        // discriminator + size of BitmapAccount.bits + length of BitmapAccount.bits
        space = 8 + 4 + bitmap_size as usize,
        seeds = [b"bitmap", epoch_pda.key().as_ref()],
        bump
    )]
   pub bitmap_pda: Account<'info, BitmapAccount>,

   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(epoch_id: u64)]
pub struct VerifyMerkleTree<'info> {
   #[account(mut)]
   pub signer: Signer<'info>,

   #[account(mut)]
   pub epoch_pda: Account<'info, EpochAccount>,

   #[account(mut)]
   pub bitmap_pda: Account<'info, BitmapAccount>,

   pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct DataAccount {
   pub counter: u64,
}

#[account]
#[derive(InitSpace)]
pub struct ItemAccount {
   pub index: u64,
   pub value: u64,
}

pub static OWNER_WALLET: Pubkey = Pubkey::new_from_array([
   216, 92, 65, 244, 142, 169, 55, 135, 113, 86, 119, 243, 161, 196, 241, 32, 169, 63, 99, 222,
   194, 16, 45, 27, 67, 8, 202, 50, 68, 42, 73, 204,
]);

#[error_code]
pub enum ErrorCode {
   #[msg("Undefined Error")]
   UndefinedError,
   #[msg("The vector index is out of bounds.")]
   OutOfBounds,
   #[msg("Unvalid Proof!")]
   InvalidProof,
   #[msg("You are not authorized to perform this action.")]
   Unauthorized,
}
