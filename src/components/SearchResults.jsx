import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import "../styles/user/searchresults.css";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    fetch(`${import.meta.env.VITE_API_URL}/api/products/search?query=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Search failed');
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setProducts([]);
        setLoading(false);
      });
  }, [query]);

  if (loading) {
    return (
      <div className="search-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching for products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <h2 className="search-heading">
        Search Results for: <span>"{query}"</span>
      </h2>

      {products.length === 0 ? (
        <div className="no-results-container">
          <div className="no-results-icon">🔍</div>
          <p className="no-results-title">No products found</p>
          <p className="no-results-text">
            Try different keywords or browse our categories
          </p>
          <a href="/homepage" className="back-home-btn">
            Back to Home
          </a>
        </div>
      ) : (
        <>
          <p className="results-count">
            Found {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
          <div className="search-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;