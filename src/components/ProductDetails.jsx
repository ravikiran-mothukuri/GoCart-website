import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CartContext from "./CartContext";
import { WishlistContext } from "./WishlistContext";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: string }

  const { addToWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${id}`
        );
        const data = await res.json();
        setProduct(data);

        setImageUrl(data.imageUrl);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );

  const inStock = product.quantity > 0;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("error", "Please login first.");
      return;
    }

    if (product.quantity <= 0) {
      showMessage("error", "This item is out of stock.");
      return;
    }
    const success = await addToCart(product);
    if (success) showMessage("success", `${product.name} added to cart!`);
  };

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("error", "Please login first.");
      return;
    }

    const result = await addToWishlist(product);

    if (result?.status === "no-login") {
      showMessage("error", "Please login first!");
    } else if (result.status === "exists") {
      showMessage("info", "Product already in wishlist!");
    } else {
      showMessage("success", "Product added to wishlist!");
    }
  };

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("error", "Please login first to Buy.");
      return;
    }

    if (!inStock) {
      showMessage("error", "This item is out of stock.");
      return;
    }
    addToCart(product);
    navigate("/cart");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showMessage("success", "Link copied to clipboard!");
    } catch {
      showMessage("error", "Share failed. Copy manually.");
    }
  };

  const getStockBadge = () => {
    if (product.quantity > 10) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
          In Stock ({product.quantity})
        </span>
      );
    } else if (product.quantity > 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
          Low Stock Only {product.quantity} left!
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
          Out of Stock
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Toast Notification */}
      {message && (
        <div className="fixed top-24 right-4 z-50 animate-bounce rounded-xl bg-gray-900/90 px-6 py-3 text-white shadow-xl backdrop-blur-sm">
          {message.text}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid gap-8 overflow-hidden rounded-2xl bg-white p-6 shadow-xl md:grid-cols-2 lg:gap-12">
          {/* Image Section */}
          <div className="flex items-center justify-center rounded-xl bg-gray-50 p-8">
            <img
              src={imageUrl}
              alt={product.name}
              className="max-h-[400px] w-full object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
                {product.brand}
              </p>
              <h1 className="mt-2 text-4xl font-extrabold text-gray-900">
                {product.name}
              </h1>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-3xl font-bold text-green-600">
                  ${product.price}
                </span>
                {getStockBadge()}
              </div>
            </div>

            <div className="space-y-4 rounded-xl bg-gray-50 p-6">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-600">Category</span>
                <span className="font-semibold text-gray-900">
                  {product.category}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-600">Release Date</span>
                <span className="font-semibold text-gray-900">
                  {product.releasedate}
                </span>
              </div>
              <div>
                <span className="block mb-1 font-medium text-gray-600">
                  Description
                </span>
                <p className="text-sm leading-relaxed text-gray-700">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                className="flex-1 rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:-translate-y-0.5 hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:grayscale"
                onClick={() => handleAddToCart(product)}
                disabled={!inStock}
              >
                {inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                className="flex-1 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:grayscale"
                disabled={!inStock}
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            <div className="flex gap-4">
              <button
                className="flex-1 rounded-xl border-2 border-green-500 bg-white px-4 py-2.5 font-semibold text-green-600 transition-colors hover:bg-green-50"
                onClick={handleAddToWishlist}
              >
                Add to Wishlist
              </button>
              <button
                className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                onClick={handleShare}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
