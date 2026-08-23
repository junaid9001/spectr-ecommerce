import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./components/orders.css";
import Navbar from "./components/navbar";

export default function Orders() {
  const [state, setstate] = useState([]);
  const navigate = useNavigate();
  const userdata = JSON.parse(localStorage.getItem("user"));
  const user = userdata ? userdata.id : null;

  useEffect(() => {
    if (!user) return;

    axios
      .get(`http://localhost:4006/users?id=${user}`)
      .then((res) => {
        setstate(res.data);
      })
      .catch((err) => console.log(err));
  }, [user]);

  function handleBuyAgain(item) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
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

    axios
      .patch(`http://localhost:4006/users/${user.id}`, { cart: updatedcart })
      .then((res) => {
        const updateuser = { ...user, cart: res.data.cart };
        localStorage.setItem("user", JSON.stringify(updateuser));
        
        // Notify Navbar badge immediately
        window.dispatchEvent(new Event("cartUpdated"));
        
        navigate("/cart");
      })
      .catch((err) => console.log(err));
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="orders-page">
          <div className="orders-empty-state">
            <p className="orders-empty-title">Please Login to View Orders</p>
            <Link to="/login" className="back-to-profile">Go to Login →</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="orders-page">
        <div className="orders-header">
          <Link to="/profile" className="back-to-profile">
            ← Back to Account
          </Link>
          <h1 className="orders-title">Purchase History</h1>
        </div>

        {state.map((item) => (
          <div key={item.id} className="orders-container">
            {item.orders && item.orders.length > 0 ? (
              [...item.orders].reverse().map((order, index) => {
                const orderTotal = order.price * order.quantity;

                return (
                  <div key={index} className="order-group-card">
                    <div className="order-group-header">
                      <div className="order-meta-info">
                        <span className="order-id-label">
                          Transaction Reference: #SPCT-{order.id || index + 100}
                        </span>
                        <span className="order-date-label">
                          Status: Paid via Stripe
                        </span>
                      </div>
                      <span className="order-status-badge">Completed</span>
                    </div>

                    <div className="order-group-items">
                      <div className="order-group-item-row">
                        <img
                          src={order.img || "/images/item1.png"}
                          alt={order.name}
                          className="order-group-item-thumb"
                          onError={(e) => {
                            e.target.src = "/images/item1.png";
                          }}
                        />
                        <div className="order-group-item-info">
                          <h4 className="order-group-item-name">{order.name}</h4>
                          <span className="order-group-item-details">
                            Brand: {order.brand || "SPECTR"} | Qty: {order.quantity}
                          </span>
                          
                          {/* Buy again action link inside item card */}
                          <button
                            onClick={() => handleBuyAgain(order)}
                            className="buy-again-btn"
                          >
                            Buy Again
                          </button>
                        </div>
                        <span className="order-group-item-price">
                          ₹{order.price?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="order-group-summary">
                      <span className="order-group-total-label">Total Paid</span>
                      <span className="order-group-total-val">
                        ₹{orderTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="orders-empty-state">
                <p className="orders-empty-title">No purchases recorded yet</p>
                <Link to="/store" className="back-to-profile">
                  Explore Catalog →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
