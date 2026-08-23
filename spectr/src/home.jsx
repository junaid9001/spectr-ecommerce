import React from "react";
import Navbar from "./components/navbar";
import Hero from "./hero";
import Underhero1 from "./underhero1";
import Underhero2 from "./underhero2";
import Footer from "./footer";
import "./App.css"; // Ensure App.css styles are loaded

export default function Home() {
  const loggedinuser = JSON.parse(localStorage.getItem("user"));
  if (loggedinuser) {
    console.log("user");
  } else {
    console.log("not user");
  }

  return (
    <>
      <div className="home-snap-container">
        <Navbar />
        <section className="home-snap-section">
          <Hero />
        </section>
        <section className="home-snap-section">
          <Underhero1 />
        </section>
        <section className="home-snap-section">
          <Underhero2 />
        </section>
        <section className="home-snap-section">
          <Footer />
        </section>
      </div>
    </>
  );
}
