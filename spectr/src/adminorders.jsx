import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./components/admin.css";

export default function Adminorders() {
  const [orders, setOrders] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const adminId = user ? user.id : null;

  useEffect(() => {
    if (!adminId) {
      navigate("/login");
      return;
    }

    const headers = { "x-admin-id": adminId };

    // Fetch All Orders
    axios
      .get("http://localhost:4006/orders/all", { headers })
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error fetching orders:", err));
  }, [adminId, navigate]);

  function triggerToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  }

  function updateOrderStatus(userId, orderIndex, productName, status) {
    const headers = { "x-admin-id": adminId };

    axios
      .patch(
        "http://localhost:4006/orders/status",
        { userId, orderIndex, productName, status },
        { headers }
      )
      .then(() => {
        triggerToast(`Status updated to ${status}`);
        
        // Refresh local orders list
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (
              order.userId === userId &&
              (order.orderIndex === orderIndex || order.name === productName)
            ) {
              return { ...order, status };
            }
            return order;
          })
        );
      })
      .catch((err) => {
        console.error("Error updating order status:", err);
        triggerToast("Failed to update status");
      });
  }

  return (
    <>
      <div className="admin-page">
        <div className="admin-header">
          <h1 className="admin-title">SPECTR // MANAGEMENT DESK</h1>
          <Link to="/store" className="back-to-store">
            ← Storefront
          </Link>
        </div>

        {/* Tab Menu Navigation */}
        <div className="admin-menu">
          <NavLink to="/admin" className="admin-menu-link">
            Overview
          </NavLink>
          <NavLink to="/admin/orders" className="admin-menu-link active">
            Transactions
          </NavLink>
          <NavLink to="/admin/products" className="admin-menu-link">
            Catalog Management
          </NavLink>
          <NavLink to="/admin/users" className="admin-menu-link">
            Client Directory
          </NavLink>
        </div>

        {/* Dedicated Transactions Desk */}
        <div className="admin-section">
          <h2 className="admin-section-title">Client Transaction Log</h2>
          
          {orders.length === 0 ? (
            <p style={{ fontFamily: 'Space Grotesk', color: 'rgba(0,0,0,0.4)' }}>
              No client transactions recorded yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Buyer</th>
                    <th>Product</th>
                    <th>Subtotal</th>
                    <th>Transaction Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => {
                    const statusVal = order.status || "PAID // PROCESSING";
                    const isProcessing = statusVal === "PAID // PROCESSING";
                    const isShipped = statusVal === "SHIPPED";

                    return (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{order.username}</div>
                          <div style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.45)', marginTop: '4px' }}>
                            {order.email}
                          </div>
                        </td>
                        <td>
                          <div className="admin-order-item-cell">
                            <img
                              src={order.img || "/images/item1.png"}
                              alt={order.name}
                              className="admin-order-item-thumb"
                              onError={(e) => {
                                e.target.src = "/images/item1.png";
                              }}
                            />
                            <div>
                              <h4 className="admin-order-item-name">{order.name}</h4>
                              <span style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.4)' }}>
                                Quantity: {order.quantity}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>
                            ₹{(order.price * order.quantity).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              isProcessing
                                ? "processing"
                                : isShipped
                                ? "shipped"
                                : "delivered"
                            }`}
                          >
                            {statusVal}
                          </span>
                        </td>
                        <td>
                          <div className="admin-status-actions">
                            {isProcessing && (
                              <button
                                onClick={() =>
                                  updateOrderStatus(
                                    order.userId,
                                    order.orderIndex,
                                    order.name,
                                    "SHIPPED"
                                  )
                                }
                                className="admin-action-btn"
                              >
                                Ship Order
                              </button>
                            )}
                            {(isProcessing || isShipped) && (
                              <button
                                onClick={() =>
                                  updateOrderStatus(
                                    order.userId,
                                    order.orderIndex,
                                    order.name,
                                    "DELIVERED"
                                  )
                                }
                                className="admin-action-btn"
                              >
                                Deliver
                              </button>
                            )}
                            {statusVal === "DELIVERED" && (
                              <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.3)', fontWeight: 600 }}>
                                FULFILLED
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
