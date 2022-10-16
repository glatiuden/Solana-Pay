import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import products from "./products.json";

const usdcAddress = new PublicKey(
  "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
);
const sellerAddress = "3WdN9tYAoSgcVUS2ypUKucP6VFmXY5teFvuzmEMY9CCq";
const sellerPublicKey = new PublicKey(sellerAddress);

async function createTransaction(req, res) {
  try {
    const { buyer, orderID, itemID } = req.body;

    if (!buyer) {
      return res.status(400).json({
        message: "Missing buyer address",
      });
    }

    if (!orderID) {
      return res.status(400).json({
        message: "Missing order ID",
      });
    }

    const itemPrice = products.find(({ id }) => id === itemID).price;
    if (!itemPrice) {
      return res.status(400).json({
        message: "Item not found. Please check item ID.",
      });
    }

    const bigAmount = BigNumber(itemPrice);
    const buyerPublicKey = new PublicKey(buyer);
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);

    const buyerUsdcAddress = await getAssociatedTokenAddress(
      usdcAddress,
      buyerPublicKey
    );

    const shopUsdcAddress = await getAssociatedTokenAddress(
      usdcAddress,
      sellerPublicKey
    );

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("finalized");

    const usdcMint = await getMint(connection, usdcAddress);

    const tx = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: buyerPublicKey,
    });

    // TO TRANSFER SOL
    // const transferInstruction = SystemProgram.transfer({
    //   fromPubkey: buyerPublicKey,
    //   lamports: bigAmount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
    //   toPubkey: sellerPublicKey,
    // });

    // TO TRANSFER USDC
    const transferInstruction = createTransferCheckedInstruction(
      buyerUsdcAddress,
      usdcAddress, // This is the address of the token we want to transfer
      shopUsdcAddress,
      buyerPublicKey,
      bigAmount.toNumber() * 10 ** usdcMint.decimals,
      usdcMint.decimals // The token could have any number of decimals
    );

    transferInstruction.keys.push({
      pubkey: new PublicKey(orderID),
      isSigner: false,
      isWritable: false,
    });

    tx.add(transferInstruction);

    const serializedTransaction = tx.serialize({
      requireAllSignatures: false,
    });

    const base64 = serializedTransaction.toString("base64");
    return res.status(200).json({
      transaction: base64,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "error creating tx" });
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    return await createTransaction(req, res);
  }
  return res.status(405).send(`Method ${req.method} not allowed`);
}
