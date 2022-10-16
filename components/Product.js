import React from "react";
import Buy from "./Buy";

import styles from "../styles/Product.module.css";

const Product = ({ product }) => {
  const { id, name, price, description, imageUrl } = product;

  return (
    <div className={styles.product_container}>
      <div>
        <img className={styles.product_image} src={imageUrl} alt={name} />
      </div>
      <div className={styles.product_details}>
        <div className={styles.product_text}>
          <div className={styles.product_title}>{name}</div>
          <div className={styles.product_description}>{description}</div>
        </div>

        <div className={styles.product_action}>
          <div className={styles.product_price}>{price} USDC</div>
          <Buy itemID={id.toNumber()} />
        </div>
      </div>
    </div>
  );
};

export default Product;
