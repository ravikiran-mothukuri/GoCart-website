import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Category icons mapping - using emojis for simplicity
const categoryIcons = {
    Laptop: "💻",
    Mobile: "📱",
    Headphone: "🎧",
    Electronics: "⚡",
    Toys: "🧸",
    Fashion: "👕",
    // Add more as needed
};

// Category colors for visual variety
const categoryColors = {
    Laptop: "from-blue-400 to-blue-600",
    Mobile: "from-purple-400 to-purple-600",
    Headphone: "from-pink-400 to-pink-600",
    Electronics: "from-yellow-400 to-yellow-600",
    Toys: "from-green-400 to-green-600",
    Fashion: "from-red-400 to-red-600",
};

const CategoryGrid = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/products`
            );
            if (!response.ok) throw new Error("Failed to fetch products");
            const data = await response.json();

            // Extract unique categories with product count
            const categoryMap = {};
            data.forEach((product) => {
                if (categoryMap[product.category]) {
                    categoryMap[product.category]++;
                } else {
                    categoryMap[product.category] = 1;
                }
            });

            const categoriesArray = Object.keys(categoryMap).map((cat) => ({
                name: cat,
                count: categoryMap[cat],
                icon: categoryIcons[cat] || "📦",
                color: categoryColors[cat] || "from-gray-400 to-gray-600",
            }));

            setCategories(categoriesArray);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6">
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200"></div>
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="h-32 animate-pulse rounded-2xl bg-gray-200"
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">
                    Shop by Category
                </h2>
                <p className="mt-1 text-sm text-gray-600 md:text-base">
                    Browse our collection by category
                </p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
                {categories.map((category) => (
                    <Link
                        to={`/category/${category.name}`}
                        key={category.name}
                        className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-5"
                    >
                        {/* Gradient Background */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                        ></div>

                        {/* Content */}
                        <div className="relative flex flex-col items-center justify-center text-center">
                            {/* Icon */}
                            <div className="mb-2 text-4xl transition-transform duration-300 group-hover:scale-110 md:mb-3 md:text-5xl">
                                {category.icon}
                            </div>

                            {/* Category Name */}
                            <h3 className="mb-1 text-sm font-semibold text-gray-800 md:text-base">
                                {category.name}
                            </h3>

                            {/* Product Count */}
                            <p className="text-xs text-gray-500 md:text-sm">
                                {category.count} {category.count === 1 ? "item" : "items"}
                            </p>
                        </div>

                        {/* Hover Indicator */}
                        <div
                            className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${category.color} scale-x-0 transition-transform duration-300 group-hover:scale-x-100`}
                        ></div>
                    </Link>
                ))}
            </div>

            {/* View All Link */}
            {categories.length > 0 && (
                <div className="mt-6 text-center">
                    <Link
                        to="/homepage"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-green-600 hover:to-green-700 hover:shadow-xl"
                    >
                        <span>View All Products</span>
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default CategoryGrid;
