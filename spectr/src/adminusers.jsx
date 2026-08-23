import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./components/admin.css";

export default function Adminusers() {
  const [usersList, setUsersList] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const adminId = user ? user.id : null;

  useEffect(() => {
    if (!adminId) {
      navigate("/login");
      return;
    }

    fetchUsers();
  }, [adminId, navigate]);

  function fetchUsers() {
    // Call user lookup compatibility route (which also lists all if no id is specified)
    axios
      .get("http://localhost:4006/users")
      .then((res) => {
        // Filter out any invalid items
        setUsersList(res.data.filter(u => u && u.id));
      })
      .catch((err) => console.error("Error fetching users:", err));
  }

  function triggerToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  }

  function handleToggleAdmin(targetUser) {
    const confirmToggle = window.confirm(
      `Are you sure you want to change administrative access for ${targetUser.username}?`
    );
    if (!confirmToggle) return;

    const headers = { "x-admin-id": adminId };
    const newRole = !targetUser.isAdmin;

    axios
      .patch(
        `http://localhost:4006/users/${targetUser.id}/role`,
        { isAdmin: newRole },
        { headers }
      )
      .then((res) => {
        triggerToast(`${targetUser.username} is now ${newRole ? "an Admin" : "a Client"}`);
        
        // Update local list
        setUsersList((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, isAdmin: res.data.isAdmin } : u))
        );
      })
      .catch((err) => {
        console.error("Error toggling role:", err);
        triggerToast("Failed to modify user access");
      });
  }

  function handleDeleteUser(targetId, targetName) {
    if (targetId === adminId) {
      triggerToast("You cannot delete your own admin account.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to completely delete user account: ${targetName}? This action is permanent.`
    );
    if (!confirmDelete) return;

    const headers = { "x-admin-id": adminId };

    axios
      .delete(`http://localhost:4006/users/${targetId}`, { headers })
      .then(() => {
        triggerToast("User account removed successfully");
        setUsersList(usersList.filter((u) => u.id !== targetId));
      })
      .catch((err) => {
        console.error("Error deleting user:", err);
        triggerToast("Failed to delete user account");
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
          <NavLink to="/admin/orders" className="admin-menu-link">
            Transactions
          </NavLink>
          <NavLink to="/admin/products" className="admin-menu-link">
            Catalog Management
          </NavLink>
          <NavLink to="/admin/users" className="admin-menu-link active">
            Client Directory
          </NavLink>
        </div>

        {/* Client List */}
        <div className="admin-section">
          <h2 className="admin-section-title">Client Directory</h2>
          
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client Account</th>
                  <th>Client ID</th>
                  <th>System Role</th>
                  <th>Orders Logged</th>
                  <th>Management Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => {
                  const ordersCount = u.orders ? u.orders.length : 0;
                  const isCurrentAdmin = u.id === adminId;

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.username}</div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.45)', marginTop: '4px' }}>
                          {u.email}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'Space Grotesk', fontSize: '0.8rem', color: 'rgba(0,0,0,0.4)' }}>
                          #SPCT-00{u.id}
                        </span>
                      </td>
                      <td>
                        <span 
                          style={{ 
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            fontSize: '0.72rem',
                            color: u.isAdmin ? '#000' : 'rgba(0,0,0,0.45)' 
                          }}
                        >
                          {u.isAdmin ? "✦ Admin" : "Client"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                          {ordersCount}
                        </span>
                      </td>
                      <td>
                        <div className="admin-status-actions">
                          <button
                            onClick={() => handleToggleAdmin(u)}
                            className="admin-action-btn"
                            disabled={isCurrentAdmin}
                            style={isCurrentAdmin ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                          >
                            {u.isAdmin ? "Demote" : "Make Admin"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="admin-action-btn"
                            disabled={isCurrentAdmin}
                            style={
                              isCurrentAdmin 
                                ? { opacity: 0.3, cursor: 'not-allowed' } 
                                : { color: '#ff0000', borderColor: 'rgba(255,0,0,0.15)' }
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
