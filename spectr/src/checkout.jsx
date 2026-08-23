import { useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Navbar from "./components/navbar";
import "./components/checkout.css";

export default function Checkout() {
  const location = useLocation();
  const { cartitem, total } = location.state || { cartitem: [], total: 0 };

  const [shipping, setShipping] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  function handleChange(e) {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  }

  function handlebuy(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !cartitem || cartitem.length === 0) {
      alert("No cart items found.");
      return;
    }

    // Call Express backend to create Stripe Checkout Session
    axios
      .post("http://localhost:4006/orders/checkout", {
        userId: user.id || user._id,
        cartItems: cartitem,
      })
      .then((res) => {
        if (res.data && res.data.url) {
          // Redirect user to secure Stripe Checkout page
          window.location.href = res.data.url;
        } else {
          alert("Failed to initiate payment. Please try again.");
        }
      })
      .catch((err) => {
        console.error("Stripe Checkout error:", err);
        alert("Payment gateway communication failed.");
      });
  }

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-layout">
          <div className="checkout-header">
            <h1 className="checkout-title">Checkout</h1>
            <div className="checkout-steps">
              <span className="checkout-step-active">01 / Shipping Details</span>
              <div className="checkout-step-divider"></div>
              <span>02 / Secure Payment</span>
            </div>
          </div>

          {cartitem.length === 0 ? (
            <div className="checkout-empty">
              <p className="checkout-empty-text">No items to checkout</p>
            </div>
          ) : (
            <>
              {/* Left: Shipping Form */}
              <div className="checkout-form-section">
                <h3 className="checkout-section-label">Shipping Details</h3>
                <form onSubmit={handlebuy} className="checkout-form" id="checkout-form">
                  <div className="checkout-form-row">
                    <div className="checkout-field">
                      <label className="checkout-label">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shipping.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="checkout-input"
                        required
                      />
                    </div>
                    <div className="checkout-field">
                      <label className="checkout-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={shipping.email}
                        onChange={handleChange}
                        placeholder="john@domain.com"
                        className="checkout-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="checkout-field">
                    <label className="checkout-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shipping.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="checkout-input"
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label className="checkout-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={shipping.address}
                      onChange={handleChange}
                      placeholder="Street, Apartment, Building"
                      className="checkout-input"
                      required
                    />
                  </div>

                  <div className="checkout-form-row">
                    <div className="checkout-field">
                      <label className="checkout-label">City</label>
                      <input
                        type="text"
                        name="city"
                        value={shipping.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="checkout-input"
                        required
                      />
                    </div>
                    <div className="checkout-field">
                      <label className="checkout-label">State</label>
                      <input
                        type="text"
                        name="state"
                        value={shipping.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="checkout-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="checkout-field" style={{ maxWidth: "200px" }}>
                    <label className="checkout-label">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={shipping.pincode}
                      onChange={handleChange}
                      placeholder="560001"
                      className="checkout-input"
                      required
                    />
                  </div>
                </form>
              </div>

              {/* Right: Order Summary Sidebar */}
              <div className="checkout-summary">
                <h3 className="checkout-summary-title">Order Summary</h3>

                {cartitem.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <span className="checkout-item-name">{item.name}</span>
                    <span className="checkout-item-qty">×{item.quantity}</span>
                    <span className="checkout-item-price">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}

                <div className="checkout-total-row">
                  <span className="checkout-total-label">Total</span>
                  <span className="checkout-total-value">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Submits form on click to trigger required validations */}
                <button type="submit" form="checkout-form" className="checkout-pay-btn">
                  Pay with Stripe
                </button>

                <div className="checkout-payment-methods">
                  <span className="payment-methods-title">Accepted Payments</span>
                  <div className="payment-methods-icons">
                    <span className="payment-icon">VISA</span>
                    <span className="payment-icon">MC</span>
                    <span className="payment-icon">AMEX</span>
                    <span className="payment-icon">APPLE PAY</span>
                  </div>
                </div>

                <p className="checkout-stripe-badge">Secured by Stripe ✦</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
