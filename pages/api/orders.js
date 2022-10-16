import orders from "./orders.json";
import { writeFile } from "fs/promises";

const get = (req, res) => {
  const { buyer } = req.query;
  const buyerOrders = orders.filter((order) => order.buyer === buyer);
  if (buyerOrders.length) {
    return res.status(200).json(buyerOrders);
  }
  return res.status(204).send();
};

const post = async (req, res) => {
  console.log("Received add order request", req.body);
  try {
    const newOrder = req.body;
    const orderDoesNotExist = !orders.find(
      (order) =>
        order.buyer === newOrder.buyer.toString() &&
        order.itemID === newOrder.itemID
    );

    if (orderDoesNotExist) {
      orders.push(newOrder);
      await writeFile(
        "./pages/api/orders.json",
        JSON.stringify(orders, null, 2)
      );
      return res.status(200).json(orders);
    }

    return res.status(400).send("Order already exists");
  } catch (err) {
    console.error(err);
    return res.status(400).send(err);
  }
};

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return get(req, res);
    case "POST":
      return await post(req, res);
    default:
      return res.status(405).send(`Method ${req.method} not allowed`);
  }
}
