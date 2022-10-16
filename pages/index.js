import React, { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { BN } from "@project-serum/anchor";

import { productsState } from "../atoms";

import HeadComponent from "../components/Head";
import CreateProduct from "../components/CreateProduct";
import Product from "../components/Product";
import { TWITTER_HANDLE, TWITTER_LINK } from "../libs/constants";
import { getProgram, baseAccount } from "../libs/utils";
import { SystemProgram } from "@solana/web3.js";

const App = () => {
  const { publicKey } = useWallet();
  const { publicKey: baseAccountPubkey } = baseAccount;
  const isOwner = publicKey
    ? publicKey.toString() === process.env.NEXT_PUBLIC_OWNER_PUBLIC_KEY
    : false;

  const [products, setProducts] = useRecoilState(productsState);
  const [creating, setCreating] = useState(false);
  const [program, setProgram] = useState(null);

  const createBaseAccount = async () => {
    try {
      const program = await getProgram();
      const tx = await program.methods
        .initialize()
        .accounts({
          baseAccount: baseAccount.publicKey,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([baseAccount])
        .rpc();

      console.log("Your transaction signature", tx);
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccountPubkey.toString()
      );
      await fetchProducts();
    } catch (err) {
      console.error("Error creating BaseAccount account:", err);
    }
  };

  const createProduct = async (newProduct, file) => {
    try {
      const maxID = products.reduce(
        (max, product) => Math.max(max, product.id),
        0
      );

      await program.methods
        .addProduct(
          new BN(maxID + 1),
          newProduct.name,
          newProduct.price,
          newProduct.description,
          newProduct.image_url,
          file.filename,
          file.hash
        )
        .accounts({
          baseAccount: baseAccount.publicKey,
          publicKey,
        })
        .rpc();

      alert("Product added!");
    } catch (err) {
      console.error("Unable to add product", err);
    } finally {
      setCreating(false);
      await fetchProducts();
    }
  };

  const fetchProducts = async () => {
    try {
      const program = await getProgram();
      setProgram(program);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      const data = account.productList;
      console.log("Products", data);
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products", err);
      await createBaseAccount();
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchProducts();
    }
  }, [publicKey]);

  const renderNotConnectedContainer = () => (
    <div className="button-container">
      <WalletMultiButton className="cta-button connect-wallet-button" />
    </div>
  );

  const renderItemBuyContainer = () => (
    <div className="products-container">
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );

  return (
    <div className="App">
      <HeadComponent />
      <div className="container">
        <header className="header-container">
          <p className="header"> 😳 Buildspace Emoji Store 😈</p>
          <p className="sub-text">
            The only emoji store that accepts sh*tcoins
          </p>
          {isOwner && (
            <button
              className="create-product-button"
              onClick={() => setCreating(!creating)}
            >
              {creating ? "Close" : "Create Product"}
            </button>
          )}
        </header>

        <main>
          {creating && <CreateProduct createProduct={createProduct} />}
          {publicKey ? renderItemBuyContainer() : renderNotConnectedContainer()}
        </main>

        <div className="footer-container">
          <img
            alt="Twitter Logo"
            className="twitter-logo"
            src="twitter-logo.svg"
          />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
