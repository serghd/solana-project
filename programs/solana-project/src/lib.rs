use anchor_lang::prelude::*;

declare_id!("FYRdHLXSnHaPXHvn8fzJvuirFsw5sxVLWeGubmWeFkTA");

#[error_code]
pub enum ErrorCode {
   #[msg("Undefined Error")]
   UndefinedError,
   #[msg("The vector index is out of bounds.")]
   OutOfBounds,
   #[msg("You are not authorized to perform this action.")]
   Unauthorized,
}

#[program]
pub mod solana_project {
   use super::*;

   pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
      let data_account = &mut ctx.accounts.data_account;
      data_account.owner = ctx.accounts.owner.key();
      data_account.counter = 0u64;

      let security_account = &mut ctx.accounts.security_account;
      security_account.owner = ctx.accounts.owner.key();     

      msg!("Data account created: {}", data_account.key().to_string());
      msg!("Security.txt account created: {}", security_account.key().to_string());
      Ok(())
   }

   pub fn add_value(ctx: Context<AddValue>, value: u64) -> Result<()> {
      let data = &mut ctx.accounts.data_account;
      let item = &mut ctx.accounts.item_account;
      require!(ctx.accounts.owner.key() == data.owner, ErrorCode::Unauthorized);
      
      item.owner = ctx.accounts.owner.key();
      item.index = data.counter;
      item.value = value;

      data.counter += 1;

      msg!("Value has been added. Item owner {}, value {}", item.owner.key().to_string(), value.to_string());
      Ok(())
   }

   pub fn get_value(ctx: Context<GetValue>) -> Result<()> {
      let item = &ctx.accounts.item_account;
      msg!("Stored index is {}. Value is: {}", item.index, item.value);
      Ok(())
   }

   pub fn update_value(ctx: Context<UpdateValue>, value: u64) -> Result<()> {
      let item = &mut ctx.accounts.item_account;
      require!(ctx.accounts.owner.key() == item.owner, ErrorCode::Unauthorized);

      item.value = value;

      msg!("Value has been update. Item owner {}, new value {}", item.owner.key().to_string(), item.value.to_string());
      Ok(())
   }

   pub fn reset_value(ctx: Context<ResetValue>) -> Result<()> {
      let item = &mut ctx.accounts.item_account;
      require!(ctx.accounts.owner.key() == item.owner, ErrorCode::Unauthorized);

      item.value = 0u64;

      msg!("Value has been reset. Item owner {}, new value {}", item.owner.key().to_string(), item.value.to_string());
      Ok(())
   }

   pub fn update_security_txt(ctx: Context<UpdateSecurity>, security_txt: String) -> Result<()> {
      let security_account = &mut ctx.accounts.security_account;
      require!(ctx.accounts.owner.key() == security_account.owner, ErrorCode::Unauthorized);
      security_account.data = security_txt;
      msg!("Security.txt data updated: {}", security_account.data.to_string());
      Ok(())
   }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
   #[account(
      init,
      payer = owner,
      // discriminator + Pubkey + counter
      space = 8 + std::mem::size_of::<Pubkey>() + std::mem::size_of::<u64>())
   ]
   pub data_account: Account<'info, DataAccount>,

   #[account(
        init,
        payer = owner,
        // descriminator + data + owner
        space = 8 + 520 + 8,
        seeds = [b"security_txt_2"],
        bump,
    )]
    pub security_account: Account<'info, SecurityAccount>,

   #[account(mut)]
   pub owner: Signer<'info>,

   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddValue<'info> {
   #[account(mut)]
   pub data_account: Account<'info, DataAccount>,  

   #[account(
        init,
        payer = owner,
        space = 8 + std::mem::size_of::<Pubkey>() + (2 * std::mem::size_of::<u64>()), // discriminator + Pubkey + index + value
    )]
   pub item_account: Account<'info, ItemAccount>,
  
   #[account(mut)]
   pub owner: Signer<'info>,
   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetValue<'info> {
   pub item_account: Account<'info, ItemAccount>,
}

#[derive(Accounts)]
pub struct UpdateValue<'info> {
   #[account(mut)]
   pub item_account: Account<'info, ItemAccount>,
   
   #[account(mut)]
   pub owner: Signer<'info>,
   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResetValue<'info> {
   #[account(mut)]
   pub item_account: Account<'info, ItemAccount>,
   
   #[account(mut)]
   pub owner: Signer<'info>,
   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateSecurity<'info> {
   #[account(mut)]
   pub security_account: Account<'info, SecurityAccount>,
  
   #[account(mut)]
   pub owner: Signer<'info>,
   pub system_program: Program<'info, System>,
}

#[account]
pub struct DataAccount {
   pub counter: u64,
   pub owner: Pubkey,
}

#[account]
pub struct ItemAccount {
   pub index: u64,
   pub value: u64,
   pub owner: Pubkey,
}

#[account]
pub struct SecurityAccount {
   pub data: String,
   pub owner: Pubkey,
}
