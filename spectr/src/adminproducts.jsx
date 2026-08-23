import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./components/admin.css";
import "./components/adminproducts.css";

export default function Adminproducts() {
  const [products, setProducts] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    brand: "",
    name: "",
    category: "Sunglasses",
    price: "",
    description: "",
    img: "",
    features: "",
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const adminId = user ? user.id : null;

  useEffect(() => {
    if (!adminId) {
      navigate("/login");
      return;
    }

    // Fetch catalog products
    axios
      .get("http://localhost:4006/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, [adminId, navigate]);

  function triggerToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  }

  function handleInputChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleAddOrUpdateProduct(e) {
    e.preventDefault();
    const headers = { "x-admin-id": adminId };

    if (editingId) {
      // Edit / Update existing product in Atlas
      axios
        .patch(`http://localhost:4006/products/${editingId}`, formData, { headers })
        .then((res) => {
          triggerToast("Product details updated");
          setProducts((prev) =>
            prev.map((p) => (p.id === editingId ? res.data : p))
          );
          handleCancelEdit();
        })
        .catch((err) => {
          console.error("Error updating product:", err);
          triggerToast("Failed to update product");
        });
    } else {
      // Create new product
      axios
        .post("http://localhost:4006/products", formData, { headers })
        .then((res) => {
          triggerToast("Product uploaded successfully");
          setProducts([...products, res.data]);
          
          setFormData({
            brand: "",
            name: "",
            category: "Sunglasses",
            price: "",
            description: "",
            img: "",
            features: "",
          });
        })
        .catch((err) => {
          console.error("Error creating product:", err);
          triggerToast("Failed to upload product");
        });
    }
  }

  function handleStartEdit(p) {
    setEditingId(p.id);
    setFormData({
      brand: p.brand || "",
      name: p.name || "",
      category: p.category || "Sunglasses",
      price: p.price || "",
      description: p.description || "",
      img: p.img || "",
      features: p.features ? (Array.isArray(p.features) ? p.features.join(", ") : p.features) : "",
    });
    // Smooth scroll to form container at top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormData({
      brand: "",
      name: "",
      category: "Sunglasses",
      price: "",
      description: "",
      img: "",
      features: "",
    });
  }

  function handleDeleteProduct(id) {
    const confirmDelete = window.confirm("Are you sure you want to remove this product from the store?");
    if (!confirmDelete) return;

    const headers = { "x-admin-id": adminId };

    axios
      .delete(`http://localhost:4006/products/${id}`, { headers })
      .then(() => {
        triggerToast("Product removed successfully");
        setProducts(products.filter((p) => p.id !== id));
        if (editingId === id) {
          handleCancelEdit();
        }
      })
      .catch((err) => {
        console.error("Error deleting product:", err);
        triggerToast("Failed to delete product");
      });
  }

  return (
    <>
      <div className="admin-page">
        <div className="admin-header">
          <h1 className="admin-title">SPECT<span className="mirror">R</span> Desk</h1>
          <Link to="/store" className="back-to-store">
            ← Storefront
          </Link>
        </div>

        {/* Tab Menu Navigation */}
        <div className="admin-menu">
          <NavLink to="/admin" className="admin-menu-link">
            Overview
          </NavLink>
          <NavLink to="/admin/products" className="admin-menu-link active">
            Catalog Management
          </NavLink>
          <NavLink to="/admin/users" className="admin-menu-link">
            Client Directory
          </NavLink>
        </div>

        {/* Add/Edit Product Form */}
        <div className="admin-form-container">
          <h2 className="admin-section-title">
            {editingId ? `Edit Eyewear: ${formData.name}` : "Upload New Eyewear Release"}
          </h2>
          <form onSubmit={handleAddOrUpdateProduct}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Brand Label</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g. Gentle Monster"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Dreamer 01"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ height: "45px", background: "transparent" }}
                >
                  <option value="Sunglasses">Sunglasses</option>
                  <option value="Optical">Optical</option>
                  <option value="Smart Glasses">Smart Glasses</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Price (INR)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g. 24000"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image Path / URL</label>
                <input
                  type="text"
                  name="img"
                  value={formData.img}
                  onChange={handleInputChange}
                  placeholder="e.g. /images/item1.png"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specifications (comma-separated)</label>
                <input
                  type="text"
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  placeholder="e.g. Zeiss Lenses, 100% UV Protection, Acetate Frame"
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Product Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter a brief, premium product description..."
                  className="form-input"
                  required
                />
              </div>
            </div>

            <button type="submit" className="admin-submit-btn">
              {editingId ? "Save Changes" : "Publish Product"}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="admin-cancel-btn"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Catalog List */}
        <div className="admin-section">
          <h2 className="admin-section-title">Current active inventory</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-order-item-cell">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="admin-order-item-thumb"
                          onError={(e) => {
                            e.target.src = "/images/item1.png";
                          }}
                        />
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                      </div>
                    </td>
                    <td>{p.brand}</td>
                    <td>{p.category}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        ₹{p.price?.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td>
                      <div className="admin-status-actions">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="admin-edit-btn"
                          style={{ marginRight: "15px" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="admin-delete-btn"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Clean Custom Toast message */}
      {toastMessage && (
        <div className="editorial-toast" style={{ right: '40px', bottom: '40px' }}>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
