import { useState, useRef } from "react";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "myamazonimages"); // your preset

  const res = await fetch(`${import.meta.env.VITE_MAPBOX_BUCKET}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.secure_url;
};

const AddProduct = () => {
  const token = localStorage.getItem("token");
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    releasedate: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!imageFile) {
        showMessage("error", "Please select an image!");
        setLoading(false);
        return;
      }

      const imageUrl = await uploadToCloudinary(imageFile);

      // 2️⃣ Build product JSON
      const productData = {
        ...product,
        price: parseFloat(product.price),
        quantity: parseInt(product.quantity),
        imageUrl: imageUrl,
      };

      // 3️⃣ Send JSON to backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/addProduct`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        }
      );

      if (response.ok) {
        showMessage("success", "Product added successfully!");
        setProduct({
          name: "",
          brand: "",
          description: "",
          price: "",
          category: "",
          quantity: "",
          releasedate: "",
        });
        setImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        showMessage("error", "Failed to add product");
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "An error occurred while adding the product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
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

      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Add New Product
        </h2>


        <form onSubmit={handleSubmit}>
          {/* Product Fields */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 transition-all focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10"
              value={product.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              required
              className="block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 transition-all focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10"
              value={product.brand}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              required
              rows="4"
              className="block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 transition-all focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10"
              value={product.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Price
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                className="block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 transition-all focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10"
                value={product.price}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Category
              </label>
              <select
                name="category"
                required
                className="block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 transition-all focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10"
                value={product.category}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                <option value="Laptop">Laptop</option>
                <option value="Headphone">Headphone</option>
                <option value="Mobile">Mobile</option>
                <option value="Electronics">Electronics</option>
                <option value="Toys">Toys</option>
                <option value="Fashion">Fashion</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Stock Quantity
              </label>
              <input
                type="number"
                name="quantity"
                required
                min="0"
                className="block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 transition-all focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10"
                value={product.quantity}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Release Date
            </label>
            <input
              type="date"
              name="releasedate"
              required
              className="block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 transition-all focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10"
              value={product.releasedate}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-8">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-6 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-green-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
