import { Link } from "react-router-dom";
import '../styles/searchcard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="search-card">

      <img
        src={product.imageUrl}
        alt={product.name}
        className="search-image"
      />

      <h3>{product.name}</h3>

      <p><strong>Brand:</strong> {product.brand}</p>
      <p><strong>Category:</strong> {product.category}</p>

      <div className="divider"></div>

      <p><strong>Price:</strong> ₹{product.price}</p>

      <div className="search-cta">
        <Link to={`/product/${product.id}`}>
          <button className="search-btn">View Details</button>
        </Link>
      </div>

    </div>
  );
};

export default ProductCard;
