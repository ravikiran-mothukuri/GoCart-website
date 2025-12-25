import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");


  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        // const res = await axios.get(
        //   `${import.meta.env.VITE_API_URL}/api/products/search?keyword=${query}`
        // );
        const res = await axios.get(
  `${import.meta.env.VITE_API_URL}/api/products/search?query=${encodeURIComponent(query)}`
);

        setProducts(res.data);
      } catch (err) {
        console.error("Error searching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Search Results
        </h2>
        <p className="mt-2 text-gray-500">
          Found {products.length} results for{" "}
          <span className="font-bold text-gray-900">"{query}"</span>
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-sm">
          <div className="mb-4 text-6xl">🔍</div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">
            No products found
          </h3>
          <p className="text-gray-500">
            Try searching for something else or check your spelling.
          </p>
          <Link to="/homepage" className="mt-6 inline-block rounded-xl bg-gray-900 px-6 py-2 font-bold text-white shadow-lg transition-transform hover:scale-105">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 p-4">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-green-600">
                  {product.brand}
                </p>
                <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900" title={product.name}>
                  {product.name}
                </h3>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  {product.quantity > 0 ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                      In Stock
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;