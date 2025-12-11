import { useState,useRef } from "react";
import '../styles/addproduct.css';

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "myamazonimages");  // your preset

  const res = await fetch(
    `${import.meta.env.VITE_MAPBOX_BUCKET}`,
    { method: "POST", body: formData }
  );

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
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please select an image!");
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
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/addProduct`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

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

    if (response.ok) {
      alert("Product added successfully!");
    } else {
      alert("Failed to add product");
    }  
  };

  return (
    <div className="addProduct-container">
      <h2>Add New Product</h2>
      <form className="addProduct-form" onSubmit={handleSubmit}>
        {/* Product Fields */}
        <div className="form-group">
          <label>Product Name</label>
          <input type="text" name="name" value={product.name} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Brand</label>
          <input type="text" name="brand" value={product.brand} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={product.description} onChange={handleInputChange} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price</label>
            <input type="number" name="price" value={product.price} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={product.category} onChange={handleInputChange}>
              <option value="">Select Category</option>
              <option value="Laptop">Laptop</option>
              <option value="Headphone">Headphone</option>
              <option value="Mobile">Mobile</option>
              <option value="Electronics">Electronics</option>
              <option value="Toys">Toys</option>
              <option value="Fashion">Fashion</option>
            </select>
          </div>
          <div className="form-group">
            <label>Stock Quantity</label>
            <input type="number" name="quantity" value={product.quantity} onChange={handleInputChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Release Date</label>
          <input type="date" name="releasedate" value={product.releasedate} onChange={handleInputChange} />
        </div>

        <div className="form-group">
          <label>Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef} // ✅ attach ref here
          />
        </div>

        <button type="submit" className="btn-submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
