import React from "react";
import Modela from "./assets/vid1.mp4";
import "./components/underhero1.css";
import { Link } from "react-router-dom";

export default function Underhero1() {
  return (
    <div className="underhero1-root">
      <Link to="/product_details/1" className="underhero1">
        {/* Background Grid Overlay */}
        <div className="video-overlay"></div>

        {/* Left Side Vertical Page Indicator */}
        <div className="uh1-vertical-indicator">
          <span className="indicator-num">01</span>
          <span className="indicator-line"></span>
          <span className="indicator-num active">02</span>
          <span className="indicator-line"></span>
          <span className="indicator-num">03</span>
        </div>

        {/* Center Sunglasses Video Wrapper */}
        <div className="uh1-video-wrapper">
          <video
            src={Modela}
            autoPlay
            loop
            muted
            playsInline
            className="video1"
          ></video>
        </div>

        {/* Center Main Slogan Overlay */}
        <div className="uh1-slogan-wrapper">
          <span className="side-text left-text">DYSTO</span>
          <span className="side-text right-text">VERGE</span>
        </div>

        {/* Bottom Technical Grid */}
        <div className="uh1-bottom-grid">
          {/* Bottom Left Specs */}
          <div className="uh1-bottom-left">
            <span className="specs-title">FUTURE ISN'T COMING.</span>
            <span className="specs-title">IT'S ALREADY HERE.</span>
            <span className="specs-body">EXPERIMENTAL DESIGN FOR A NEW REALITY.</span>
          </div>

          {/* Bottom Center Explore Link */}
          <div className="uh1-bottom-center">
            <span className="btn-explore-center">EXPLORE COLLECTION</span>
            <div className="explore-indicator">
              <span className="indicator-vertical-line"></span>
              <span className="indicator-vertical-dot"></span>
            </div>
          </div>

          {/* Bottom Right Specs */}
          <div className="uh1-bottom-right">
            <span className="num-large">01</span>
            <span className="specs-title">FW26 COLLECTION</span>
            <span className="specs-body">LIMITED QUANTITY RUN [100 UNITS]</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
