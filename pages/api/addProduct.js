import products from "./products.json";
import fs from "fs";

const post = (req, res) => {
  try {
    console.log("Body", req.body);
    const { name, price, image_url, description, filename, hash } = req.body;
    const maxID = products.reduce(
      (max, product) => Math.max(max, product.id),
      0
    );
    products.push({
      id: maxID + 1,
      name,
      price,
      image_url,
      description,
      filename,
      hash,
    });
    fs.writeFileSync(
      "./pages/api/products.json",
      JSON.stringify(products, null, 2)
    );
    return res.status(200).send({ status: "ok" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error adding product" });
  }
};

export default function handler(req, res) {
  if (req.method === "POST") {
    return post(req, res);
  }
  return res.status(405).send(`Method ${req.method} not allowed`);
}
