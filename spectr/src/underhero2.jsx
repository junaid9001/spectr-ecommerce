import React from "react";
import "./components/underhero2.css";
import { Link } from "react-router-dom";
import Modelc from "./assets/vid102.mp4";
import Modeld from "./assets/vid101.mp4";

export default function Underhero2() {
  return (
    <div className="underhero2-root">
      <div className="underhero2container">
        <Link to="/product_details/5" className="underhero2item">
          <video
            src={Modeld}
            autoPlay
            loop
            muted
            playsInline
            className="underhero2video"
          ></video>
          <div className="underherotext">
            <h2>TEKKEN</h2>
          </div>
        </Link>

        <Link to="/product_details/8" className="underhero2item">
          <video
            src={Modelc}
            autoPlay
            loop
            muted
            playsInline
            className="underhero2video"
          ></video>
          <div className="underherotext">
            <h2>WAR|CRAFT</h2>
          </div>
        </Link>
      </div>

      <div className="underhero2-action-container">
        <Link to="/store" className="btn-explore-more">
          EXPLORE MORE <span className="arrow">→</span>
        </Link>
      </div>
    </div>
  );
}
