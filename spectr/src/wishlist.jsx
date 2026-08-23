import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./components/wishlist.css";
import Navbar from "./components/navbar";

// SVG cross / remove icon
const RemoveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="#000"
    width="18"
    height="18"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Wishlist() {
  const [product, setproduct] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:4006/products")
      .then((res) => {
        setproduct(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (product.length > 0 && user) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userWishlist = storedUser ? storedUser.wishlist || [] : [];
      const items = userWishlist.map((id) => product.find((p) => p.id === id)).filter(Boolean);
      setWishlistItems(items);
    }
  }, [product]);

  function triggerToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  }

  function triggerWishlistBadgeUpdate() {
    window.dispatchEvent(new Event("wishlistUpdated"));
  }

  function triggerCartBadgeUpdate() {
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function removeWishlist(id) {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) return;

    const wishlist = currentUser.wishlist || [];
    const updatedWishlist = wishlist.filter((itemId) => itemId !== id);
    const updateduser = { ...currentUser, wishlist: updatedWishlist };
    localStorage.setItem("user", JSON.stringify(updateduser));
    triggerWishlistBadgeUpdate();

    // Update local state
    setWishlistItems(wishlistItems.filter((item) => item.id !== id));

    axios
      .patch(`http://localhost:4006/users/${currentUser.id}`, { wishlist: updatedWishlist })
      .catch((err) => console.log(err));

    triggerToast("Removed from Wishlist");
  }

  function handlecart(item) {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) return;

    const cart = currentUser.cart || [];
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

    const updateduser = { ...currentUser, cart: updatedcart };
    localStorage.setItem("user", JSON.stringify(updateduser));
    triggerCartBadgeUpdate();

    axios
      .patch(`http://localhost:4006/users/${currentUser.id}`, { cart: updatedcart })
      .then(() => {
        triggerToast("Added to Bag");
      })
      .catch((err) => console.log(err));
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="wishlist-page">
        <div className="wishlist-header">
          <h1 className="wishlist-title">My Wishlist</h1>
          <span className="wishlist-count">
            {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty-state">
            <p className="wishlist-empty-title">Your wishlist is empty</p>
            <Link to="/store" className="wishlist-empty-link">
              Explore Collection →
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <div key={item.id} className="wishlist-card">
                <Link to={`/product_details/${item.id}`}>
                  <div className="product-image-container">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="wishlist-image"
                    />
                    {/* Delete / remove from wishlist button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeWishlist(item.id);
                      }}
                      className="wishlist-remove-btn"
                      title="Remove from Wishlist"
                    >
                      <RemoveIcon />
                    </button>
                  </div>
                </Link>

                <div className="wishlist-info">
                  <span className="wishlist-brand">{item.brand || "SPECTR"}</span>
                  <h2 className="wishlist-name">{item.name}</h2>
                  <span className="wishlist-price">₹{item.price?.toLocaleString("en-IN")}</span>
                </div>

                <button
                  onClick={() => handlecart(item)}
                  className="wishlist-add-btn"
                >
                  Add to Bag
                </button>
              </div>
            ))}
          </div>
        )}
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
