import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import CartContext from "./CartContext";
import "../styles/homepage.css";



const Homepage = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext); 
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  
  const handleAddToCart= (product)=>{
    const inStock = product.quantity <= 0;
    if (inStock) {
      alert("This item is out of stock.");
      return;
    }
    addToCart(product);
    alert(`${product.name} added to cart!`);
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/product/${id}`, {
        method: "DELETE",
        headers: {
        Authorization: `Bearer ${token}`,
  },
      });

      if (response.ok) {
        setProducts(products.filter((product) => product.id !== id));
        alert("Product deleted successfully!");
      } else {
        console.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="homepage-container">
      <h1>Available Products</h1>

      {products.length === 0 ? (
        <p className="empty">No products available.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id} tabIndex={0}>
              
              <img
                src={product.imageUrl} 
                alt={product.name}
                className="product-image"
              />

              <h3>{product.name}</h3>
              <p><strong>Brand:</strong> {product.brand}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <div className="divider"></div>
              <p><strong>Price:</strong> ${product.price}</p>
              <p>
                <strong>Stock:</strong>{" "}
                <span
                  className={
                    product.quantity > 10
                      ? "in-stock"
                      : product.quantity > 0
                      ? "low-stock"
                      : "out-of-stock"
                  }
                >
                  {product.quantity > 0 ? product.quantity : "Out of stock"}
                </span>
              </p>
              <p><strong>Release Date:</strong> {product.releasedate}</p>
              <p className="description"><strong>Description:</strong> {product.description}</p>

              <div className="cta">
                <button
                  className="btn btn-primary"
                  
                  onClick={()=> handleAddToCart(product)}
                  disabled={product.quantity === 0}
                >
                  Add to Cart
                </button>

                <Link to={`/product/${product.id}`}>
                  <button className="btn btn-ghost">View Details</button>
                </Link>

                {role==="ADMIN" && (

                <button
                  className="icon-btn btn-danger"
                  onClick={() => handleDelete(product.id)}
                  aria-label={`Delete ${product.name}`}
                  title="Delete"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M6 7h12l-1 14H7L6 7zm5-3h2l1 1h4v2H4V5h4l1-1z"
                    />
                  </svg>
                </button>
              )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Homepage;
