import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./components/cart.css";
import Navbar from "./components/navbar";

export default function Cart() {
  const [product, setproduct] = useState([]);
  const [cartitem, setcartitems] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const usercart = user ? user.cart || [] : [];

  useEffect(() => {
    axios
      .get("http://localhost:4006/products")
      .then((res) => setproduct(res.data));
  }, []);

  useEffect(() => {
    if (product.length > 0) {
      const cartitems = usercart.map((cartitem) => {
        const prodectdetails = product.find((p) => p.id === cartitem.productid);
        return { ...prodectdetails, quantity: cartitem.quantity || 1 };
      });
      setcartitems(cartitems.filter(item => item.id !== undefined));
    }
  }, [product]);

  function triggerCartBadgeUpdate() {
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function increment(id) {
    const updatedcart = cartitem.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setcartitems(updatedcart);
    const updateduser = {
      ...user,
      cart: updatedcart.map((item) => ({
        productid: item.id,
        quantity: item.quantity,
      })),
    };
    localStorage.setItem("user", JSON.stringify(updateduser));
    triggerCartBadgeUpdate();

    axios
      .patch(`http://localhost:4006/users/${user.id}`, {
        cart: updateduser.cart,
      })
      .catch((err) => console.log(err));
  }

  function decrement(id) {
    const updatedcart = cartitem.map((item) =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );

    setcartitems(updatedcart);
    const updateduser = {
      ...user,
      cart: updatedcart.map((item) => ({
        productid: item.id,
        quantity: item.quantity,
      })),
    };
    localStorage.setItem("user", JSON.stringify(updateduser));
    triggerCartBadgeUpdate();

    axios
      .patch(`http://localhost:4006/users/${user.id}`, {
        cart: updateduser.cart,
      })
      .catch((err) => console.log(err));
  }

  function removeitem(id) {
    const updatedcart = cartitem.filter((item) => item.id !== id);

    setcartitems(updatedcart);

    const updateduser = {
      ...user,
      cart: updatedcart.map((item) => ({
        productid: item.id,
        quantity: item.quantity,
      })),
    };

    localStorage.setItem("user", JSON.stringify(updateduser));
    triggerCartBadgeUpdate();

    axios
      .patch(`http://localhost:4006/users/${user.id}`, {
        cart: updateduser.cart,
      })
      .catch((err) => console.log(err));
  }

  function addRecommended(item) {
    const cart = user.cart || [];
    const itemexist = cart.find((cartitem) => cartitem.productid === item.id);
    let updatedcart;
    if (itemexist) {
      updatedcart = cart.map((cartitem) =>
        cartitem.productid === item.id
          ? { ...cartitem, quantity: cartitem.quantity + 1 }
          : cartitem
      );
    } else {
      updatedcart = [...cart, { productid: item.id, quantity: 1 }];
    }

    const updateduser = { ...user, cart: updatedcart };
    localStorage.setItem("user", JSON.stringify(updateduser));
    triggerCartBadgeUpdate();

    // Trigger local state reload
    const cartitems = updatedcart.map((cartitem) => {
      const prodectdetails = product.find((p) => p.id === cartitem.productid);
      return { ...prodectdetails, quantity: cartitem.quantity || 1 };
    });
    setcartitems(cartitems.filter(i => i.id !== undefined));

    axios
      .patch(`http://localhost:4006/users/${user.id}`, { cart: updatedcart })
      .catch((err) => console.log(err));
  }

  const subtotal = cartitem.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const navigate = useNavigate();

  function direct() {
    navigate("/checkout", { state: { cartitem, total: subtotal } });
  }

  // Filter recommendations: products that are NOT already in the cart
  const cartProductIds = cartitem.map(item => item.id);
  const recommendations = product
    .filter(p => !cartProductIds.includes(p.id))
    .slice(0, 3);

  return (
    <>
      <Navbar />
      <div className="cart-page">
        <div className="cart-header">
          <h1 className="cart-title">Shopping Bag</h1>
          <span className="cart-count">
            {cartitem.length} {cartitem.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        {cartitem.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty-text">Your bag is empty</p>
            <Link to="/store" className="cart-empty-link">
              Explore Collection →
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartitem.map((item) => (
                <div key={item.id} className="cart-row">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="cart-thumb"
                  />
                  <div className="cart-info">
                    <h3 className="cart-product-name">{item.name}</h3>
                    <span className="cart-product-brand">{item.brand || "SPECTR Eyewear"}</span>
                    <span className="cart-product-price">₹{item.price?.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="cart-actions">
                    <div className="cart-qty-row">
                      <button
                        onClick={() => decrement(item.id)}
                        className="cart-qty-btn"
                      >
                        −
                      </button>
                      <span className="cart-qty-value">{item.quantity}</span>
                      <button
                        onClick={() => increment(item.id)}
                        className="cart-qty-btn"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeitem(item.id)}
                      className="cart-remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary-block">
              {/* Promo code field */}
              <div className="cart-promo-section">
                <input
                  type="text"
                  placeholder="Promo Code"
                  className="cart-promo-input"
                />
                <button className="cart-promo-btn">Apply</button>
              </div>

              {/* Price Breakdown */}
              <div className="cart-breakdown">
                <div className="cart-breakdown-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="cart-breakdown-row">
                  <span>Shipping</span>
                  <span>Complimentary</span>
                </div>
              </div>

              {/* Final Summary Total */}
              <div className="cart-summary">
                <p className="cart-total">
                  Total{" "}
                  <span className="cart-total-amount">₹{subtotal.toLocaleString("en-IN")}</span>
                </p>
              </div>

              <button onClick={direct} className="cart-checkout-btn">
                Proceed to Checkout
              </button>
            </div>
          </>
        )}

        {/* Cross-Sell Recommendations */}
        {recommendations.length > 0 && (
          <div className="cart-recommendations">
            <h3 className="rec-title">You May Also Like</h3>
            <div className="rec-grid">
              {recommendations.map((item) => (
                <div key={item.id} className="rec-card">
                  <div className="rec-thumb-container">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="rec-thumb"
                    />
                  </div>
                  <div className="rec-info">
                    <h4 className="rec-name">{item.name}</h4>
                    <span className="rec-price">₹{item.price?.toLocaleString("en-IN")}</span>
                  </div>
                  <button
                    onClick={() => addRecommended(item)}
                    className="rec-add-btn"
                  >
                    Add to Bag
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
