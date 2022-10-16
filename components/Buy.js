import React, { useState, useMemo, useEffect } from "react";
import { Keypair, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { InfinitySpin } from "react-loader-spinner";
import IPFSDownload from "./IpfsDownload";
import { addOrder, fetchItem, hasPurchased } from "../libs/api";
import { findReference, FindReferenceError } from "@solana/pay";
import { STATUS } from "../libs/constants";

const Buy = ({ itemID }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const orderID = useMemo(() => Keypair.generate().publicKey, []); // Public key used to identify the order

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(STATUS.INITIAL); // Tracking transaction status

  const order = useMemo(
    () => ({
      buyer: publicKey.toString(),
      orderID: orderID.toString(),
      itemID,
    }),
    [publicKey, orderID, itemID]
  );

  const processTransaction = async () => {
    setLoading(true);
    const txResponse = await fetch("../api/createTransaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
    const txData = await txResponse.json();
    const tx = Transaction.from(Buffer.from(txData.transaction, "base64"));
    console.log("Tx data is", tx);
    try {
      // Send the transaction to the network
      const txHash = await sendTransaction(tx, connection);
      console.log(
        `Transaction sent: https://solscan.io/tx/${txHash}?cluster=devnet`
      );
      setStatus(STATUS.SUBMITTED);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getItem = async (itemID) => {
    const item = await fetchItem(itemID);
    setItem(item);
  };

  useEffect(() => {
    // Check if transaction was confirmed
    if (status === STATUS.SUBMITTED) {
      setLoading(true);
      const interval = setInterval(async () => {
        try {
          // Look for our orderID on the blockchain
          const result = await findReference(connection, orderID);
          console.log("Finding tx reference", result.confirmationStatus);

          // If the transaction is confirmed or finalized, the payment was successful
          if (
            result.confirmationStatus === "confirmed" ||
            result.confirmationStatus === "finalized"
          ) {
            clearInterval(interval);
            setStatus(STATUS.PAID);
            setLoading(false);
            addOrder(order);
          }
        } catch (err) {
          if (err instanceof FindReferenceError) {
            return null;
          }
          console.error("Unknown error", err);
        } finally {
          setLoading(false);
        }
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }

    if (status === STATUS.PAID) {
      getItem(itemID);
    }
  }, [status]);

  const checkPurchased = async () => {
    const purchased = await hasPurchased(publicKey, itemID);
    if (!purchased) {
      return;
    }

    setStatus(STATUS.PAID);
    console.log("Address has already purchased this item!");
    const item = await fetchItem(itemID);
    setItem(item);
  };

  useEffect(() => {
    checkPurchased();
  }, [publicKey, itemID]);

  if (!publicKey) {
    return (
      <div>
        <p>You need to connect your wallet to make transactions</p>
      </div>
    );
  }

  if (loading) {
    return <InfinitySpin color="gray" />;
  }

  return (
    <div>
      {item ? (
        <IPFSDownload hash={item.hash} filename={item.filename} />
      ) : (
        <button
          disabled={loading}
          className="buy-button"
          onClick={processTransaction}
        >
          Buy now
        </button>
      )}
    </div>
  );
};

export default Buy;
