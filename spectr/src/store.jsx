import axios from "axios";
import "./components/store.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/navbar";
import { CiSearch } from "react-icons/ci";

// SVG Heart Icon
const HeartIcon = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "#000" : "none"}
    stroke="#000"
    strokeWidth="1.5"
    width="20"
    height="20"
    style={{ transition: "fill 0.3s ease" }}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export default function Store() {
  const [product, setproduct] = useState([]);
  const [search, setsearch] = useState("");
  const [brand, setbrand] = useState("");
  const [sort, setsort] = useState("");
  const [userWishlist, setUserWishlist] = useState([]);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:4006/products")
      .then((res) => setproduct(res.data));

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser && currentUser.wishlist) {
      setUserWishlist(currentUser.wishlist);
    }
  }, []);

  // Custom Toast helper
  function triggerToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  }

  function handlecart(item) {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      triggerToast("Please login to add items to your cart.");
      return;
    }
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

    axios
      .patch(`http://localhost:4006/users/${currentUser.id}`, { cart: updatedcart })
      .then((res) => {
        const updateuser = { ...currentUser, cart: res.data.cart };
        localStorage.setItem("user", JSON.stringify(updateuser));
        
        // Dispatch custom event to notify Navbar component to update the cart badge immediately
        window.dispatchEvent(new Event("cartUpdated"));

        triggerToast("Added to Bag");
      })
      .catch((err) => console.log(err));
  }

  function toggleWishlist(item) {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      triggerToast("Please login to manage your wishlist.");
      return;
    }
    const wishlist = currentUser.wishlist || [];
    const exists = wishlist.includes(item.id);
    let updatedWishlist;
    if (exists) {
      updatedWishlist = wishlist.filter(id => id !== item.id);
    } else {
      updatedWishlist = [...wishlist, item.id];
    }

    axios
      .patch(`http://localhost:4006/users/${currentUser.id}`, { wishlist: updatedWishlist })
      .then((res) => {
        const updateuser = { ...currentUser, wishlist: res.data.wishlist };
        localStorage.setItem("user", JSON.stringify(updateuser));
        
        // Notify Navbar
        window.dispatchEvent(new Event("wishlistUpdated"));

        setUserWishlist(updatedWishlist);

        triggerToast(exists ? "Removed from Wishlist" : "Added to Wishlist");
      })
      .catch((err) => console.log(err));
  }

  let filtered = product
    .filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((item) => (brand === "" ? true : item.brand === brand));
    
  if (sort === "low-high") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sort === "high-low") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  const isInWishlist = (id) => userWishlist.includes(id);

  return (
    <>
      <Navbar />
      <div className="store">
        <div className="controls">
          <div className="search-wrapper">
            <CiSearch className="search-icon" />
            <input
              type="search"
              value={search}
              onChange={(e) => setsearch(e.target.value)}
              placeholder="Search eyewear..."
              className="searchbar"
            />
          </div>

          <select value={brand} onChange={(e) => setbrand(e.target.value)}>
            <option value="">All Brands</option>
            <option value="Dystopian Verge">Dystopian</option>
            <option value="Ray-Ban Meta">Ray-Ban Meta</option>
            <option value="Gentle Monster">Gentle Monster</option>
            <option value="Cartier">Cartier</option>
            <option value="XREAL">XREAL</option>
            <option value="Lenovo">Lenovo</option>
            <option value="Rokid">Rokid</option>
            <option value="Oakley">Oakley</option>
            <option value="Solos">Solos</option>
            <option value="MYKITA">MYKITA</option>
          </select>

          <select value={sort} onChange={(e) => setsort(e.target.value)}>
            <option value="">Sort by Price</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>

        <div className="productgrid">
          {filtered.map((item) => (
            <div key={item.id} className="productcard">
              <Link
                to={`/product_details/${item.id}`}
                className="productlink"
              >
                <div className="product-image-container">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="productimage"
                  />
                  {/* Wishlist toggle button inside container absolute */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(item);
                    }}
                    className="wishlist-toggle-btn"
                    title={isInWishlist(item.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <HeartIcon filled={isInWishlist(item.id)} />
                  </button>
                </div>
                <div className="productcard-info">
                  <span className="product-brand">{item.brand || "SPECTR"}</span>
                  <h2 className="product-name">{item.name}</h2>
                  <p className="product-price">₹{item.price?.toLocaleString("en-IN")}</p>
                </div>
              </Link>
              <button onClick={() => handlecart(item)}>Add to Bag</button>
            </div>
          ))}
        </div>
      </div>

      {/* Clean custom editorial toast overlay */}
      {toastMessage && (
        <div className="editorial-toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
