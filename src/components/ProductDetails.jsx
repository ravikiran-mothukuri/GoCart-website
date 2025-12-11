import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import CartContext from "./CartContext";
import { WishlistContext } from "./WishlistContext";

import "../styles/productdetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); 

  const { addToWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);

        
        setImageUrl(data.imageUrl);

      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p>Loading...</p>;

  const inStock = product.quantity > 0;

  const handleAddToCart = () => {
    if (!inStock) {
      alert("This item is out of stock.");
      return;
    }
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const handleAddToWishlist = async () => {
  const result = await addToWishlist(product);

  if (result.status === "exists") {
    alert("Product already in wishlist!");
  } 
  else if (result.status === "added") {
    alert("Product added to wishlist!");
  }
  else if (result.status === "no-login") {
    alert("Please login first!");
  }
};


  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    } catch {
      alert("Share failed. Copy manually.");
    }
  };

  return (
    <div className="product-details">
      
      <img 
        src={imageUrl} 
        alt={product.name} 
        className="product-detail-image" />

      <h2>{product.name}</h2>
      <p><strong>Brand:</strong> {product.brand}</p>
      <p><strong>Category:</strong> {product.category}</p>
      <p className="price"><strong>Price:</strong> ${product.price}</p>

      <p>
        <strong>Stock:</strong>{" "}
        <span className={
          product.quantity > 10
            ? "in-stock"
            : product.quantity > 0
            ? "low-stock"
            : "out-of-stock"
        }>
          {inStock ? product.quantity : "Out of stock"}
        </span>
      </p>

      <p><strong>Release Date:</strong> {product.releasedate}</p>
      <p><strong>Description:</strong> {product.description}</p>

      <div className="actions">
        <button className="btn btn-cart" onClick={handleAddToCart} disabled={!inStock}>
          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>
        <button className="btn btn-buy" disabled={!inStock}>
          Buy Now
        </button>
        <button className="btn btn-ghost" onClick={()=>handleAddToWishlist(product)}>
          Add to Wishlist
        </button>
        <button className="btn btn-ghost" onClick={handleShare}>
          Share
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
