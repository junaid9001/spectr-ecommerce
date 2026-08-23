import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./components/productdetail.css";
import Navbar from "./components/navbar";

export default function Productdetail() {
  const [product, setproduct] = useState(null);
  const [qty, setqty] = useState(1);
  const [openSection, setOpenSection] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:4006/products/${id}`)
      .then((res) => setproduct(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  // Clean Custom Toast Notification Helper
  function triggerToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="pd-page">
          <div className="pd-loading">
            <p className="pd-loading-text">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  function handlecart(item) {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      triggerToast("Please login to add items to your cart.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }
    const cart = currentUser.cart || [];
    const itemexist = cart.find((cartitem) => cartitem.productid === item.id);
    let updatedcart;
    if (itemexist) {
      updatedcart = cart.map((cartitem) =>
        cartitem.productid === item.id
          ? { ...cartitem, quantity: cartitem.quantity + qty }
          : cartitem
      );
    } else {
      updatedcart = [...cart, { productid: item.id, quantity: qty }];
    }

    axios
      .patch(`http://localhost:4006/users/${currentUser.id}`, { cart: updatedcart })
      .then((res) => {
        const updateuser = { ...currentUser, cart: res.data.cart };
        localStorage.setItem("user", JSON.stringify(updateuser));

        // Dispatch cart update event to refresh Navbar badge instantly
        window.dispatchEvent(new Event("cartUpdated"));

        triggerToast(`Added ${qty} item(s) to bag`);
      })
      .catch((err) => console.log(err));
  }

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Parse features if available
  const features = product.features
    ? typeof product.features === "string"
      ? product.features.split(",").map((f) => f.trim())
      : product.features
    : [];

  return (
    <>
      <Navbar />
      <div className="pd-page">
        <div className="pd-layout">
          {/* Left: Product Image */}
          <div className="pd-image-wrapper">
            <img
              src={product.img}
              alt={product.name}
              className="pd-image"
            />
          </div>

          {/* Right: Product Info */}
          <div className="pd-info">
            <span className="pd-eyebrow">Standard Fit // Collection FW26</span>
            <span className="pd-brand">{product.brand || "SPECTR Eyewear"}</span>
            <h2 className="pd-name">{product.name}</h2>
            <span className="pd-price">₹{product.price?.toLocaleString("en-IN")}</span>

            <div className="pd-divider"></div>

            <p className="pd-description">{product.description}</p>

            {features.length > 0 && (
              <>
                <span className="pd-features-label">Specifications</span>
                <ul className="pd-features">
                  {features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="pd-feature-item">
                      {feature}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {product.category && (
              <span className="pd-category">{product.category}</span>
            )}

            {/* Quantity Selector */}
            <div className="pd-qty-selector">
              <span className="pd-qty-label">Quantity</span>
              <div className="pd-qty-controls">
                <button
                  onClick={() => setqty(Math.max(1, qty - 1))}
                  className="pd-qty-btn"
                >
                  −
                </button>
                <span className="pd-qty-val">{qty}</span>
                <button
                  onClick={() => setqty(qty + 1)}
                  className="pd-qty-btn"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => handlecart(product)}
              className="pd-add-btn"
            >
              Add to Bag
            </button>

            {/* Specs Accordion System */}
            <div className="pd-accordion">
              <div className="pd-accordion-item">
                <div
                  onClick={() => toggleSection("details")}
                  className="pd-accordion-header"
                >
                  <span>01 / Dimensions & Fit</span>
                  <span className="pd-accordion-toggle">
                    {openSection === "details" ? "−" : "+"}
                  </span>
                </div>
                {openSection === "details" && (
                  <div className="pd-accordion-content">
                    Standard sizing built for universal comfort. Lens Width: 52mm | Bridge: 20mm | Temple Length: 145mm. Includes luxury protective case and microfiber cleaning cloth.
                  </div>
                )}
              </div>

              <div className="pd-accordion-item">
                <div
                  onClick={() => toggleSection("lenses")}
                  className="pd-accordion-header"
                >
                  <span>02 / Lenses & Technology</span>
                  <span className="pd-accordion-toggle">
                    {openSection === "lenses" ? "−" : "+"}
                  </span>
                </div>
                {openSection === "lenses" && (
                  <div className="pd-accordion-content">
                    Crafted with premium CR-39 lenses offering complete UV400 protection. Engineered with anti-glare, scratch-resistant coatings for optimal visual clarity.
                  </div>
                )}
              </div>

              <div className="pd-accordion-item">
                <div
                  onClick={() => toggleSection("returns")}
                  className="pd-accordion-header"
                >
                  <span>03 / Shipping & Returns</span>
                  <span className="pd-accordion-toggle">
                    {openSection === "returns" ? "−" : "+"}
                  </span>
                </div>
                {openSection === "returns" && (
                  <div className="pd-accordion-content">
                    Enjoy complimentary express shipping across India on domestic orders. Easy returns accepted within 14 days of delivery in original packaging.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Custom Toast message */}
      {toastMessage && (
        <div className="editorial-toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
