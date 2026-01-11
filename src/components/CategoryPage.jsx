import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import CartContext from "./CartContext";

const CategoryPage = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const { addToCart } = useContext(CartContext);
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchProductsByCategory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    const fetchProductsByCategory = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/products`
            );
            if (!response.ok) throw new Error("Failed to fetch products");
            const data = await response.json();

            // Filter products by category
            const filtered = data.filter(
                (product) => product.category.toLowerCase() === category.toLowerCase()
            );
            setProducts(filtered);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
    };

    const handleAddToCart = async (product) => {
        if (!token) {
            showMessage("Please login to add items to cart.");
            return;
        }

        if (product.quantity <= 0) {
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

            {/* Breadcrumb */}
            <div className="mx-auto mb-6 max-w-7xl">
                <nav className="flex items-center gap-2 text-sm text-gray-600">
                    <Link to="/homepage" className="hover:text-green-600 transition-colors">
                        Home
                    </Link>
                    <span>/</span>
                    <span className="font-semibold text-gray-900 capitalize">{category}</span>
                </nav>
            </div>

            {/* Header */}
            <div className="mx-auto mb-8 max-w-7xl">
                <h1 className="text-3xl font-bold text-gray-800 capitalize lg:text-4xl">
                    {category}
                </h1>
                <p className="mt-2 text-gray-600">
                    {loading ? "Loading..." : `${products.length} products found`}
                </p>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="mx-auto max-w-7xl py-20 text-center">
                    <svg
                        className="mx-auto mb-4 h-24 w-24 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                    <h2 className="mb-2 text-2xl font-semibold text-gray-700">
                        No products found in this category
                    </h2>
                    <p className="mb-6 text-gray-500">
                        Try browsing other categories or check back later.
                    </p>
                    <Link
                        to="/homepage"
                        className="inline-block rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-green-600 hover:to-green-700"
                    >
                        Browse All Products
                    </Link>
                </div>
            ) : (
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <div
                            className="group relative flex flex-col rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            key={product.id}
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

                            <p className="mb-4 line-clamp-3 overflow-hidden text-sm leading-relaxed text-gray-500">
                                <strong className="font-medium text-gray-700">Description:</strong>{" "}
                                {product.description}
                            </p>

                            <div className="mt-auto flex flex-wrap items-center gap-3">
                                <button
                                    className="flex-1 rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:-translate-y-[1px] hover:from-green-600 hover:to-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.quantity === 0}
                                >
                                    Add to Cart
                                </button>

                                <Link to={`/product/${product.id}`} className="flex-1">
                                    <button className="w-full rounded-xl border-2 border-green-500 bg-white px-5 py-[10px] text-sm font-semibold text-green-600 transition-all hover:bg-green-50">
                                        Details
                                    </button>
                                </Link>

                                {role === "ADMIN" && (
                                    <button
                                        className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-red-100 text-red-600 transition-all hover:scale-105 hover:bg-red-200"
                                        onClick={() => handleDelete(product.id)}
                                        aria-label={`Delete ${product.name}`}
                                    >
                                        <svg viewBox="0 0 24 24" width="20" height="20">
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

export default CategoryPage;
