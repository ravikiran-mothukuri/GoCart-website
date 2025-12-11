import { useContext } from "react";
import { WishlistContext } from "./WishlistContext";
import "../styles/wishlist.css";

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);

  if (!wishlist || wishlist.length === 0) {
    return <p className="empty-wishlist">Your wishlist is empty 💔</p>;
  }

  return (
    <div className="wishlist-container">
      <h2 className="wishlist-title">My Wishlist</h2>

      <div className="wishlist-grid">
        {wishlist.map((item) => (
          <article key={item.wishlistItemId} className="wishlist-card">
            <div className="wishlist-media">
              <img src={item.imageUrl} alt={item.name} />
            </div>

            <div className="wishlist-content">
              <h3 className="wishlist-name">{item.name}</h3>
              <p>Brand: {item.brand}</p>
              <p className="price">${item.price}</p>
            </div>

            <div className="wishlist-actions">
              <button
                className="btn-remove"
                onClick={() => removeFromWishlist(item.productId)}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
