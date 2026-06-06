import { useState, useEffect } from "react";

function Pricing() {
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    const saved = localStorage.getItem("plan");
    if (saved) setPlan(saved);
  }, []);

  const goToCheckout = (selectedPlan) => {
    window.location.href = `/checkout?plan=${selectedPlan}`;
  };

  return (
    <section style={styles.page}>
      <div style={styles.container}>

        <h2 style={styles.title}>Pricing Plans</h2>

        <p style={styles.sub}>
          Current Plan: <b>{plan.toUpperCase()}</b>
        </p>

        <div style={styles.grid}>

          {/* FREE */}
          <div style={styles.card}>
            <h3 style={styles.planTitle}>Free</h3>
            <h1 style={styles.price}>₹0</h1>

            <ul style={styles.list}>
              <li>✔ 3 AI Plans</li>
              <li>✔ Basic Templates</li>
              <li>✔ PDF Export</li>
            </ul>

            <button
              onClick={() => {
                setPlan("free");
                localStorage.setItem("plan", "free");
              }}
              style={styles.btn}
            >
              {plan === "free" ? "Current Plan" : "Switch"}
            </button>
          </div>

          {/* PRO */}
          <div style={{ ...styles.card, ...styles.highlight }}>
            <h3 style={styles.planTitle}>Pro 🚀</h3>
            <h1 style={styles.price}>₹250</h1>

            <ul style={styles.list}>
              <li>✔ Unlimited AI Plans</li>
              <li>✔ Advanced Features</li>
              <li>✔ Priority Support</li>
            </ul>

            <button
              onClick={() => goToCheckout("pro")}
              style={styles.primaryBtn}
            >
              {plan === "pro" ? "Active Plan" : "Upgrade"}
            </button>
          </div>

          {/* ENTERPRISE */}
          <div style={styles.card}>
            <h3 style={styles.planTitle}>Enterprise</h3>
            <h1 style={styles.price}>₹999</h1>

            <ul style={styles.list}>
              <li>✔ Team Access</li>
              <li>✔ Custom Branding</li>
              <li>✔ Dedicated Support</li>
            </ul>

            <button
              onClick={() => goToCheckout("enterprise")}
              style={styles.darkBtn}
            >
              Upgrade
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ================= MODERN HOME-MATCHING UI ================= */

const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    background:
      "linear-gradient(180deg, #f8fafc 0%, #eef2ff 40%, #ffffff 100%)",
    minHeight: "100vh",
    padding: "80px 20px",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    textAlign: "center",
  },

  title: {
    fontSize: "38px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "10px",
  },

  sub: {
    color: "#6b7280",
    marginBottom: "40px",
    fontSize: "16px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "25px",
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    transition: "0.3s ease",
    textAlign: "left",
  },

  highlight: {
    border: "2px solid #2563eb",
    transform: "scale(1.03)",
  },

  planTitle: {
    fontSize: "20px",
    fontWeight: "bold",
  },

  price: {
    fontSize: "36px",
    margin: "10px 0",
    color: "#111827",
  },

  list: {
    listStyle: "none",
    padding: 0,
    marginTop: "15px",
    color: "#374151",
    lineHeight: "1.8",
  },

  btn: {
    marginTop: "20px",
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    background: "white",
    cursor: "pointer",
  },

  primaryBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  },

  darkBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#111827",
    color: "white",
    cursor: "pointer",
  },
};

export default Pricing;