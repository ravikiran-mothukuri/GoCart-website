// Homepage.jsx
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import CartContext from "./CartContext";

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [categories, setCategories] = useState([]); // Available categories
  const [selectedCategory, setSelectedCategory] = useState("All"); // Selected category filter
  const [message, setMessage] = useState(null);
  const { addToCart } = useContext(CartContext);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products`
        );
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setAllProducts(data);
        setProducts(data);

        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(p => p.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory === "All") {
      setProducts(allProducts);
    } else {
      setProducts(allProducts.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, allProducts]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddToCart = async (product) => {
    if (!token) {
      showMessage("Please login to add items to cart.");
      return;
    }

    const inStock = product.quantity <= 0;
    if (inStock) {
      showMessage("This item is out of stock.");
      return;
    }

    const success = await addToCart(product);
    if (success) {
      showMessage(`${product.name} added to cart!`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/product/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setProducts(products.filter((product) => product.id !== id));
        showMessage("Product deleted successfully!");
      } else {
        console.error("Failed to delete product");
        showMessage("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 px-4 py-8 text-gray-800">
      {message && (
        <div
          className="fixed left-1/2 top-24 z-[9999] flex min-w-[280px] max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-xl bg-gray-900/90 px-5 py-3.5 text-white shadow-2xl backdrop-blur-sm transition-all sm:left-auto sm:right-6 sm:top-28 sm:min-w-[320px] sm:translate-x-0"
          role="alert"
        >
          <span className="text-sm font-medium sm:text-base">{message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mx-auto mb-6 max-w-7xl">
        <h1 className="mb-4 text-center text-3xl font-bold text-gray-800 lg:text-4xl">
          {selectedCategory === "All" ? "All Products" : selectedCategory}
        </h1>
        <p className="text-center text-gray-600">
          {products.length} {products.length === 1 ? "product" : "products"} found
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mx-auto mb-8 max-w-7xl">
          <div className="overflow-x-auto pb-2">
            <div className="flex flex-wrap justify-center gap-3 min-w-max px-4 md:px-0">
              {/* All Categories Button */}
              <button
                onClick={() => setSelectedCategory("All")}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${selectedCategory === "All"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                  }`}
              >
                All ({allProducts.length})
              </button>

              {/* Category Buttons */}
              {categories.map((category) => {
                const count = allProducts.filter(p => p.category === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${selectedCategory === category
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                      }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <p className="py-12 text-center text-lg text-gray-500">
          No products available.
        </p>
      ) : (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              className="group relative flex flex-col rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500/20"
              key={product.id}
              tabIndex={0}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="mb-4 h-60 w-full rounded-xl bg-gray-100 object-cover"
              />

              <h3 className="mb-2 text-xl font-semibold leading-tight text-gray-900">
                {product.name}
              </h3>
              <p className="mb-1 text-sm text-gray-500">
                <strong className="font-medium text-gray-700">Brand:</strong>{" "}
                {product.brand}
              </p>
              <p className="mb-3 text-sm text-gray-500">
                <strong className="font-medium text-gray-700">Category:</strong>{" "}
                {product.category}
              </p>

              <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

              <p className="mb-2 text-2xl font-bold text-green-600">
                ${product.price}
              </p>

              <p className="mb-2 text-sm text-gray-500">
                <strong className="font-medium text-gray-700">Stock:</strong>{" "}
                <span
                  className={`font-semibold ${product.quantity > 10
                    ? "text-green-600"
                    : product.quantity > 0
                      ? "text-orange-600"
                      : "text-red-600"
                    }`}
                >
                  {product.quantity > 0 ? product.quantity : "Out of stock"}
                </span>
              </p>
              <p className="mb-2 text-sm text-gray-500">
                <strong className="font-medium text-gray-700">Release Date:</strong>{" "}
                {product.releaseDate}
              </p>
              <p className="mb-4 line-clamp-3 overflow-hidden text-sm leading-relaxed text-gray-500">
                <strong className="font-medium text-gray-700">Description:</strong>{" "}
                {product.description}
              </p>

              <div className="mt-auto flex flex-wrap items-center gap-3">
                <button
                  className="flex-1 rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:-translate-y-[1px] hover:from-green-600 hover:to-green-700 hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.quantity === 0}
                >
                  Add to Cart
                </button>

                <Link to={`/product/${product.id}`} className="flex-1">
                  <button className="w-full rounded-xl border-2 border-green-500 bg-white px-5 py-[10px] text-sm font-semibold text-green-600 transition-all hover:bg-green-50 hover:text-green-700">
                    Details
                  </button>
                </Link>

                {role === "ADMIN" && (
                  <button
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-red-100 text-red-600 transition-all hover:scale-105 hover:bg-red-200 hover:text-red-700"
                    onClick={() => handleDelete(product.id)}
                    aria-label={`Delete ${product.name}`}
                    title="Delete"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      aria-hidden="true"
                    >
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
