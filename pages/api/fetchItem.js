import products from "./products.json";

export default function handler(req, res) {
  if (req.method === "POST") {
    const { itemID } = req.body;

    if (!itemID) {
      return res.status(400).send("Missing Item ID");
    }

    const product = products.find(({ id }) => id === itemID);
    if (product) {
      const { hash, filename } = product;
      return res.status(200).send({ hash, filename });
    }
    return res.status(404).send("Item not found");
  }
  return res.status(405).send(`Method ${req.method} not allowed`);
}
