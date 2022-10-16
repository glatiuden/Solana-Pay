import products from "./products.json";

export default async function handler(req, res) {
  if (req.method === "GET") {
    console.log("Body", req.query);
    const productsNoHashes = products.map((product) => {
      const { hash, filename, ...rest } = product;
      return rest;
    });
    return res.status(200).json(productsNoHashes);
  }
  return res.status(405).send(`Method ${req.method} not allowed`);
}
