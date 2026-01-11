import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext.jsx";

const AddCart = () => {
  const { cartItems, updateQuantity, removeFromCart, fetchCart } =
    useContext(CartContext);
  const navigate = useNavigate();
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showMessage("error", "Please login to place an order");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/order/place`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        showMessage("success", "Order placed successfully! 🎉");
        await fetchCart(); // clear cart after order
        setTimeout(() => navigate("/orders"), 1500);
      } else {
        const error = await res.json();
        console.log("Backend error response:", error); // Debug log
        const errorMsg = error["something went wrong"] || error.message || "Failed to place order";
        showMessage("error", errorMsg);
      }
    } catch (err) {
      console.error("Error placing order:", err);
      showMessage("error", "Failed to place order. Please try again.");
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="rounded-2xl bg-white p-12 shadow-xl">
          <div className="mb-6 text-6xl">🛒</div>
          <h2 className="mb-4 text-3xl font-extrabold text-gray-900">
            Your cart is empty!
          </h2>
          <p className="mb-8 text-gray-500">
            Looks like you haven't added anything to your cart yet.
          </p>
          <a
            href="/homepage"
            className="inline-block rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 lg:px-8">
      {/* Toast Notification */}
      {message && (
        <div
          className={`fixed left-1/2 top-24 z-[9999] flex min-w-[280px] max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl backdrop-blur-sm transition-all sm:left-auto sm:right-6 sm:top-28 sm:min-w-[320px] sm:translate-x-0 ${message.type === 'success' ? 'bg-green-600 text-white' :
            message.type === 'error' ? 'bg-red-600 text-white' :
              'bg-gray-900/90 text-white'
            }`}
          role="alert"
        >
          <span className="text-sm font-medium sm:text-base">{message.text}</span>
        </div>
      )}


      <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
        Shopping Cart ({cartItems.length} items)
      </h2>

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
        {/* Cart Items List */}
        <div className="space-y-6 lg:col-span-2">
          {cartItems.map((item) => (
            <article
              key={item.cartItemId}
              className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md sm:flex-row"
            >
              <div className="h-32 w-32 shrink-0 rounded-xl bg-gray-100 p-2">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex justify-between">
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-green-600">
                      {usd.format(item.price)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Delivery in a 1 hour.
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center rounded-lg border border-gray-200">
                    <button
                      className="px-3 py-1 font-bold text-gray-600 hover:bg-gray-100"
                      onClick={() => dec(item)}
                    >
                      -
                    </button>
                    <input
                      className="w-12 border-x border-gray-200 py-1 text-center text-sm font-semibold focus:outline-none"
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
                    <button
                      className="px-3 py-1 font-bold text-gray-600 hover:bg-gray-100"
                      onClick={() => inc(item)}
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-xs text-gray-500">
                        Subtotal
                      </span>
                      <span className="font-bold text-gray-900">
                        {usd.format(item.price * item.quantity)}
                      </span>
                    </div>
                    <button
                      className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl bg-white p-8 shadow-xl">
            <h3 className="mb-6 text-xl font-bold text-gray-900">
              Order Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Items ({cartItems.length})</span>
                <span className="font-medium">
                  {usd.format(calculateTotal())}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-green-600">
                    {usd.format(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>

            <button
              className="mt-8 w-full rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-6 py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-green-500/30 active:scale-[0.98]"
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCart;