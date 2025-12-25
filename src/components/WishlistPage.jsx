/* eslint-disable no-unused-vars */
import { useContext } from "react";
import { Link } from "react-router-dom";
import { WishlistContext } from "./WishlistContext";
import { Trash2, ShoppingBag } from "lucide-react";

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="rounded-2xl bg-white p-12 shadow-xl">
          <div className="mb-6 opacity-80">
            <ShoppingBag size={80} className="mx-auto text-gray-300" />
          </div>
          <h2 className="mb-4 text-3xl font-extrabold text-gray-900">
            Your wishlist is empty!
          </h2>
          <p className="mb-8 text-gray-500">
            Save items you want to see here for later.
          </p>
          <Link
            to="/homepage"
            className="inline-block rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 lg:px-8">
      <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
        My Wishlist
      </h2>

      <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.map((item) => (
          <article
            key={item.wishlistItemId}
            className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg"
          >
            <Link to={`/product/${item.productId}`} className="group aspect-[4/3] w-full overflow-hidden bg-gray-100 p-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <div className="flex flex-1 flex-col p-6">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-green-600">
                {item.brand}
              </p>
              <Link to={`/product/${item.productId}`}>
                <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900 hover:text-green-600" title={item.name}>
                  {item.name}
                </h3>
              </Link>
              <p className="mb-4 text-xl font-bold text-green-600">
                ${item.price}
              </p>

              <button
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
                onClick={() => removeFromWishlist(item.productId)}
              >
                <Trash2 size={16} /> Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
