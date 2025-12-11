import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import "../styles/searchresults.css";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products/search?query=${query}`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [query]);

  return (
    <div className="search-page">

      <h2 className="search-heading">
        Search Results for: <span>{query}</span>
      </h2>

      {products.length === 0 ? (
        <p className="no-results">No products found.</p>
      ) : (
        <div className="search-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

    </div>
  );
};

export default SearchResults;
