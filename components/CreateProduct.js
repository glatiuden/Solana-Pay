import React, { useState } from "react";
import { Web3Storage } from "web3.storage";
import styles from "../styles/CreateProduct.module.css";

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN,
});

const CreateProduct = ({ createProduct }) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image_url: "",
    description: "",
  });
  const [file, setFile] = useState({});
  const [uploading, setUploading] = useState(false);

  const onChange = async (e) => {
    setUploading(true);
    const {
      target: { files },
    } = e;

    try {
      const file = files[0];
      console.log(file);
      const cid = await client.put(files);
      setFile({ filename: file.name, hash: cid });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e) => {
    const {
      target: { id: fieldName, value: fieldValue },
    } = e;

    setNewProduct({ ...newProduct, [fieldName]: fieldValue });
  };

  return (
    <div className={styles.background_blur}>
      <div className={styles.create_product_container}>
        <div className={styles.create_product_form}>
          <header className={styles.header}>
            <h1>Create Product</h1>
          </header>

          <div className={styles.form_container}>
            <input
              type="file"
              className={styles.input}
              accept=".zip,.rar,.7zip"
              placeholder="Emojis"
              onChange={onChange}
            />
            {file && file.name && <p className="file-name">{file.filename}</p>}
            <div className={styles.flex_row}>
              <input
                id="name"
                type="text"
                className={styles.input}
                placeholder="Product Name"
                onChange={onInputChange}
              />
              <input
                id="price"
                type="number"
                className={styles.input}
                placeholder="0.01 USDC"
                onChange={onInputChange}
              />
            </div>
            <div className={styles.flex_row}>
              <input
                id="image_url"
                type="url"
                className={styles.input}
                placeholder="Image URL ex: https://i.imgur.com/rVD8bjt.png"
                onChange={onInputChange}
              />
            </div>
            <textarea
              id="description"
              className={styles.text_area}
              placeholder="Description here..."
              onChange={onInputChange}
            />

            <button
              className={styles.button}
              onClick={() => createProduct(newProduct, file)}
              disabled={uploading}
            >
              Create Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
