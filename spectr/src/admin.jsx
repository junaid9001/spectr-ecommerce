import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./components/admin.css";

export default function Admin() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalClients: 0,
    totalProducts: 0,
  });
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

    // Fetch Stats
    axios
      .get("http://localhost:4006/orders/stats", { headers })
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching stats:", err));

    // Fetch All Orders
    axios
      .get("http://localhost:4006/orders/all", { headers })
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error fetching orders:", err));
  }, [adminId, navigate]);

  // --- KPI Stats Calculations ---
  const averageOrderValue = stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0;

  // --- SVG Sales Trend Chart Math ---
  const chartOrders = [...orders].slice(0, 8).reverse();
  let cumulativeRevenue = 0;
  const trendChartData = chartOrders.map((order, index) => {
    cumulativeRevenue += order.price * order.quantity;
    return {
      label: `T-${chartOrders.length - index}`,
      value: cumulativeRevenue
    };
  });

  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  const maxTrendVal = trendChartData.length > 0 ? Math.max(...trendChartData.map(d => d.value)) * 1.15 : 1000;
  const trendPoints = trendChartData.map((d, i) => {
    const x = paddingX + (i * (chartWidth - paddingX * 2)) / Math.max(1, trendChartData.length - 1);
    const y = chartHeight - paddingY - ((d.value - 0) * (chartHeight - paddingY * 2)) / Math.max(1, maxTrendVal - 0);
    return { x, y, label: d.label, val: d.value };
  });
  const trendPointsStr = trendPoints.map(p => `${p.x},${p.y}`).join(" ");

  // --- Category & Brand Sales Math ---
  const categorySales = { Sunglasses: 0, Optical: 0, "Smart Glasses": 0 };
  const brandSales = {};
  let totalUnitsSold = 0;

  orders.forEach((order) => {
    const qty = order.quantity || 1;
    totalUnitsSold += qty;

    // Category calculation
    const cat = order.category ? order.category.charAt(0).toUpperCase() + order.category.slice(1).toLowerCase() : "Sunglasses";
    if (cat.includes("Sunglass")) {
      categorySales.Sunglasses += qty;
    } else if (cat.includes("Optic")) {
      categorySales.Optical += qty;
    } else {
      categorySales["Smart Glasses"] += qty;
    }

    // Brand calculation
    const brand = order.brand || "SPECTR";
    brandSales[brand] = (brandSales[brand] || 0) + qty;
  });

  // Convert brand sales map to sorted array
  const brandChartData = Object.keys(brandSales).map(brand => ({
    name: brand.length > 12 ? brand.slice(0, 10) + ".." : brand,
    units: brandSales[brand]
  })).sort((a, b) => b.units - a.units).slice(0, 5);

  const maxBrandUnits = brandChartData.length > 0 ? Math.max(...brandChartData.map(b => b.units)) : 1;

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
          <NavLink to="/admin" className="admin-menu-link active">
            Overview
          </NavLink>
          <NavLink to="/admin/orders" className="admin-menu-link">
            Transactions
          </NavLink>
          <NavLink to="/admin/products" className="admin-menu-link">
            Catalog Management
          </NavLink>
          <NavLink to="/admin/users" className="admin-menu-link">
            Client Directory
          </NavLink>
        </div>

        {/* KPI metrics bar */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Net Sales Revenue</span>
            <h3 className="stat-value">₹{stats.totalRevenue?.toLocaleString("en-IN")}</h3>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Transactions</span>
            <h3 className="stat-value">{stats.totalOrders}</h3>
          </div>
          <div className="stat-card">
            <span className="stat-label">Avg Order Value (AOV)</span>
            <h3 className="stat-value">₹{averageOrderValue?.toLocaleString("en-IN")}</h3>
          </div>
          <div className="stat-card">
            <span className="stat-label">Catalog Size</span>
            <h3 className="stat-value">{stats.totalProducts}</h3>
          </div>
          <div className="stat-card">
            <span className="stat-label">Client Database</span>
            <h3 className="stat-value">{stats.totalClients}</h3>
          </div>
        </div>

        {/* First Chart Section: Sales Trend & Top Sellers */}
        <div className="admin-chart-section">
          {/* Trend Chart Card */}
          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Net Cumulative Sales Trend</h3>
            <span className="admin-chart-subtitle">Revenue progression across recent transactions</span>
            
            {trendPoints.length > 1 ? (
              <div style={{ position: "relative", width: "100%" }}>
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  style={{ width: "100%", height: "auto", overflow: "visible" }}
                >
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = paddingY + ratio * (chartHeight - paddingY * 2);
                    const gridVal = maxTrendVal - ratio * maxTrendVal;
                    return (
                      <g key={idx}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="rgba(0,0,0,0.06)"
                          strokeWidth="1"
                        />
                        <text
                          x={paddingX - 10}
                          y={y + 4}
                          fontFamily="Space Grotesk"
                          fontSize="8"
                          fill="rgba(0,0,0,0.4)"
                          textAnchor="end"
                        >
                          {gridVal >= 100000 ? `₹${(gridVal / 100000).toFixed(1)}L` : `₹${Math.round(gridVal / 1000)}k`}
                        </text>
                      </g>
                    );
                  })}

                  {/* Trend Polyline */}
                  <polyline
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    points={trendPointsStr}
                  />

                  {/* Plot Dots */}
                  {trendPoints.map((p, idx) => (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="#000"
                        stroke="#fff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={p.x}
                        y={chartHeight - 4}
                        fontFamily="Space Grotesk"
                        fontSize="9"
                        fontWeight="600"
                        fill="rgba(0,0,0,0.5)"
                        textAnchor="middle"
                      >
                        {p.label}
                      </text>
                      <text
                        x={p.x}
                        y={p.y - 8}
                        fontFamily="Space Grotesk"
                        fontSize="8"
                        fontWeight="700"
                        fill="#000"
                        textAnchor="middle"
                      >
                        ₹{Math.round(p.val / 1000)}k
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <p style={{ fontFamily: 'Space Grotesk', color: 'rgba(0,0,0,0.4)', padding: '20px 0' }}>
                Insufficient transaction data to plot trend line.
              </p>
            )}
          </div>

          {/* Top Eyewear Products */}
          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Top Eyewear Releases</h3>
            <span className="admin-chart-subtitle">Most popular frames by unit sales volume</span>
            
            {orders.length === 0 ? (
              <p style={{ fontFamily: 'Space Grotesk', color: 'rgba(0,0,0,0.4)', padding: '10px 0' }}>
                No active orders record.
              </p>
            ) : (
              <ul className="top-selling-list">
                {Object.keys(orders.reduce((acc, order) => {
                  acc[order.name] = (acc[order.name] || 0) + order.quantity;
                  return acc;
                }, {})).map(name => {
                  const sample = orders.find(o => o.name === name);
                  return {
                    name,
                    brand: sample ? sample.brand || "SPECTR" : "SPECTR",
                    quantity: orders.filter(o => o.name === name).reduce((sum, o) => sum + o.quantity, 0)
                  };
                }).sort((a, b) => b.quantity - a.quantity).slice(0, 3).map((p, idx) => (
                  <li key={idx} className="top-selling-item">
                    <div className="top-selling-info">
                      <h4 className="top-selling-name">{p.name}</h4>
                      <span className="top-selling-brand">{p.brand}</span>
                    </div>
                    <span className="top-selling-sales">{p.quantity} Sold</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Second Chart Section: Brand Bar Chart & Category progress meters */}
        <div className="admin-chart-section">
          {/* Brand Sales Bar Chart */}
          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Brand Sales Performance</h3>
            <span className="admin-chart-subtitle">Unit sales distribution across collection brand labels</span>

            {brandChartData.length > 0 ? (
              <div style={{ position: "relative", width: "100%" }}>
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  style={{ width: "100%", height: "auto", overflow: "visible" }}
                >
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = paddingY + ratio * (chartHeight - paddingY * 2);
                    const gridVal = Math.round(maxBrandUnits - ratio * maxBrandUnits);
                    return (
                      <line
                        key={idx}
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="rgba(0,0,0,0.06)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Vertical Bars */}
                  {brandChartData.map((brand, i) => {
                    const barWidth = 36;
                    const spacing = (chartWidth - paddingX * 2) / brandChartData.length;
                    const x = paddingX + i * spacing + (spacing - barWidth) / 2;
                    const barHeight = ((brand.units - 0) * (chartHeight - paddingY * 2)) / maxBrandUnits;
                    const y = chartHeight - paddingY - barHeight;

                    return (
                      <g key={i}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(2, barHeight)}
                          fill="#000"
                        />
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          fontFamily="Space Grotesk"
                          fontSize="9"
                          fontWeight="700"
                          fill="#000"
                          textAnchor="middle"
                        >
                          {brand.units}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={chartHeight - 4}
                          fontFamily="Space Grotesk"
                          fontSize="8"
                          fontWeight="600"
                          fill="rgba(0,0,0,0.5)"
                          textAnchor="middle"
                        >
                          {brand.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <p style={{ fontFamily: 'Space Grotesk', color: 'rgba(0,0,0,0.4)', padding: '20px 0' }}>
                No brand transaction records available.
              </p>
            )}
          </div>

          {/* Category Sales Distribution Progress Bars */}
          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Category Sales Distribution</h3>
            <span className="admin-chart-subtitle">Unit breakdown across eyewear classifications</span>

            {totalUnitsSold > 0 ? (
              <div style={{ marginTop: "10px" }}>
                {Object.keys(categorySales).map((catName) => {
                  const salesCount = categorySales[catName];
                  const percentage = totalUnitsSold > 0 ? Math.round((salesCount / totalUnitsSold) * 100) : 0;

                  return (
                    <div key={catName} className="category-row">
                      <div className="category-label-row">
                        <span>{catName}</span>
                        <span className="category-count-label">
                          {salesCount} Sold ({percentage}%)
                        </span>
                      </div>
                      <div className="category-bar-track">
                        <div
                          className="category-bar-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontFamily: 'Space Grotesk', color: 'rgba(0,0,0,0.4)', padding: '10px 0' }}>
                No category transactions recorded.
              </p>
            )}
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
