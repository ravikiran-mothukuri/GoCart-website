import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext.jsx";
import "../styles/user/addcart.css";

const AddCart = () => {
  const { cartItems, updateQuantity, removeFromCart, fetchCart } =
    useContext(CartContext);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to place an order");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/order/place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Order placed successfully! 🎉");
        await fetchCart(); // clear cart after order
        navigate("/orders"); // Navigate to orders page
      } else {
        const error = await res.json();
        alert(error.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    }
  };

  const usd = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
    []
  );

  const dec = async (item) => {
    if (item.quantity === 1) {
      await removeFromCart(item.productId);
    } else {
      await updateQuantity(item.productId, item.quantity - 1);
    }
  };

  const inc = async (item) => {
    await updateQuantity(item.productId, item.quantity + 1);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-content">
          <div className="empty-cart-icon">🛒</div>
          <h2 className="empty-cart-title">Your cart is empty!</h2>
          <p className="empty-cart-text">
            Looks like you haven't added anything to your cart yet.
          </p>
          <a href="/homepage" className="continue-shopping-btn">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart ({cartItems.length} items)</h2>
      </div>

      <div className="cart-grid">
        {cartItems.map((item) => (
          <article key={item.cartItemId} className="cart-card">
            <img src={item.imageUrl} alt={item.name} />

            <div className="cart-info">
              <h3 className="cart-title">{item.name}</h3>
              <p className="cart-price">{usd.format(item.price)}</p>

              <div className="qty-row">
                <button className="qty-btn" onClick={() => dec(item)}>
                  -
                </button>
                <input
                  className="qty-input"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0) {
                      updateQuantity(item.productId, value);
                    }
                  }}
                />
                <button className="qty-btn" onClick={() => inc(item)}>
                  +
                </button>
              </div>

              <div className="item-total">
                <span>Subtotal:</span>
                <span className="subtotal-price">
                  {usd.format(item.price * item.quantity)}
                </span>
              </div>

              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.productId)}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <div className="summary-card">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items ({cartItems.length}):</span>
            <span>{usd.format(calculateTotal())}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span className="free-shipping">FREE</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Total:</span>
            <span className="total-amount">{usd.format(calculateTotal())}</span>
          </div>
          <button className="place-order-btn" onClick={handlePlaceOrder}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCart;