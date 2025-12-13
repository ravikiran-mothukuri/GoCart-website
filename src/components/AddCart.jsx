import React, { useContext, useMemo} from "react";
import { CartContext } from "./CartContext.jsx";
import "../styles/addcart.css";

// chenges made. 12: 22pm
const AddCart = () => {
  const { cartItems, updateQuantity, removeFromCart, fetchCart } =
  useContext(CartContext);


  const handlePlaceOrder = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/order/place`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (res.ok) {
    alert("Order placed successfully!");
    fetchCart(); // clear cart after order
  } else {
    alert("Failed to place order");
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

  const dec = async(item) => {
    if(item.quantity==1)
      await removeFromCart(item.productId);
    else
      await updateQuantity(item.productId, item.quantity - 1)
  };

  const inc = async(item) => {
    await updateQuantity(item.productId, item.quantity + 1)
  };

  

  if (!cartItems || cartItems.length === 0) {
    return <h2 className="empty-cart">🛒 Your cart is empty!</h2>;
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Cart</h2>
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
                  value={item.quantity}
                />
                <button className="qty-btn" onClick={() => inc(item)}>
                  +
                </button>
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

      <div className="place-order-container">
        <button
          className="place-order-btn"
          onClick={() => handlePlaceOrder()}
        >
          Place Order
        </button>
      </div>

    </div>
  );
};

export default AddCart;
