use anchor_lang::prelude::*;

declare_id!("J7ZKejUKmPmYtyx839FDUCWjnKHDpmysqoZd8JgqRzmk");

#[program]
pub mod backend {
  use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        base_account.total_products = 0;
        Ok(())
    }

    pub fn add_product(ctx: Context<Create>, id: i64, name: String, price: String, description: String, image_url: String, filename: String, hash: String) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        let user = &mut ctx.accounts.user;

        let item = ProductStruct {
            id,
            name: name.to_string(),
            price: price.to_string(),
            description: description.to_string(),
            image_url: image_url.to_string(),
            filename: filename.to_string(),
            hash: hash.to_string(),
            user_address: (*user).to_account_info().key()
        };

        base_account.product_list.push(item);
        base_account.total_products += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 10000)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ProductStruct {
    pub id: i64,
    pub name: String,
    pub price: String,
    pub description: String,
    pub image_url: String,
    pub filename: String,
    pub hash: String,
    pub user_address: Pubkey
}

#[account]
pub struct BaseAccount {
    pub total_products: u64,
    pub product_list: Vec<ProductStruct>
}