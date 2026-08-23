import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./components/profile.css";
import Navbar from "./components/navbar";

export default function Profile() {
  const [state, setstate] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();
  const userdata = JSON.parse(localStorage.getItem("user"));
  const user = userdata ? userdata.id : null;

  function triggerToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }

  useEffect(() => {
    if (!userdata || !user) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:4006/users?id=${user}`)
      .then((res) => {
        if (!res.data || res.data.length === 0) {
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        setstate(res.data);
        
        // Sync local storage on payment success
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("payment_success") === "true") {
          if (res.data && res.data[0]) {
            localStorage.setItem("user", JSON.stringify(res.data[0]));
          }
          window.history.replaceState(null, '', '/profile');
          triggerToast("Payment completed successfully! Thank you for your purchase.");
        }
      })
      .catch((err) => {
        console.log(err);
        localStorage.removeItem("user");
        navigate("/login");
      });
  }, [user, navigate]);

  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/login");
  }

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
        
        // Dispatch event to update navbar cart badge instantly
        window.dispatchEvent(new Event("cartUpdated"));
        
        navigate("/cart");
      })
      .catch((err) => console.log(err));
  }

  return (
    <>
      <Navbar />
      <div className="profile-page">
        {state.map((item) => {
          const hasOrders = item.orders && item.orders.length > 0;
          const latestOrder = hasOrders ? item.orders[item.orders.length - 1] : null;

          return (
            <div key={item.id} className="profile-wrapper">
              <h1 className="profile-title">Welcome back, {item.username}</h1>
              
              <div className="profile-layout">
                {/* Left Column: Client Account Details */}
                <div className="profile-details">
                  <h3 className="profile-section-label">Client Portal</h3>

                  <div className="profile-info-block">
                    <span className="profile-info-label">Client ID</span>
                    <span className="profile-info-value">#SPCT-00{item.id}</span>
                  </div>

                  <div className="profile-info-block">
                    <span className="profile-info-label">Username</span>
                    <span className="profile-info-value">{item.username}</span>
                  </div>

                  <div className="profile-info-block">
                    <span className="profile-info-label">Email Address</span>
                    <span className="profile-info-value">{item.email}</span>
                  </div>

                  {/* Saved Address Section */}
                  <div className="profile-address-box">
                    <span className="profile-info-label">Saved Address (Default)</span>
                    <p className="profile-address-text">
                      12/A, Park Avenue, Indiranagar,<br />
                      Bangalore, Karnataka, 560038
                    </p>
                  </div>

                  <button onClick={handleLogout} className="profile-logout-btn">
                    Logout
                  </button>
                </div>

                {/* Right Column: Recent Activity Overview */}
                <div className="profile-orders">
                  <h3 className="profile-section-label">Recent Activity</h3>

                  {hasOrders ? (
                    <div className="recent-order-overview">
                      <div className="overview-header">
                        <span className="overview-title">Latest Order Overview</span>
                        <span className="overview-status">PAID // PROCESSING</span>
                      </div>

                      <div className="order-card">
                        <img
                          src={latestOrder.img || "/images/item1.png"}
                          alt={latestOrder.name}
                          className="order-image"
                          onError={(e) => {
                            e.target.src = "/images/item1.png";
                          }}
                        />
                        <div className="order-details">
                          <h4 className="order-name">{latestOrder.name}</h4>
                          <span className="order-qty">
                            Quantity: {latestOrder.quantity} | Brand: {latestOrder.brand || "SPECTR"}
                          </span>
                          
                          {/* Buy Again button on profile card */}
                          <button 
                            onClick={() => handleBuyAgain(latestOrder)}
                            className="buy-again-btn"
                          >
                            Buy Again
                          </button>
                        </div>
                        <span className="order-price">
                          ₹{(latestOrder.price * latestOrder.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <Link to="/orders" className="view-all-history-btn">
                        View Purchase History ({item.orders.length}) →
                      </Link>
                    </div>
                  ) : (
                    <div className="overview-empty">
                      <p className="orders-empty">No active transactions recorded.</p>
                      <Link to="/store" className="view-all-history-btn" style={{ borderTop: 'none', paddingTop: 0 }}>
                        Explore New Releases →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
