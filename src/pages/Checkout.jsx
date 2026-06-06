import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const plan = searchParams.get("plan") || "free";

  const [method, setMethod] = useState("card");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const pricing = {
    free: 0,
    pro: 250,
    enterprise: 999,
  };

  const features = {
    free: ["3 AI Plans", "Basic Templates", "PDF Export"],
    pro: ["Unlimited AI Plans", "Advanced AI", "Priority Support"],
    enterprise: ["Team Access", "Custom Branding", "Dedicated Support"],
  };

  const pay = () => {
    if (method === "upi" && !upiId) {
      alert("Enter UPI ID");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      localStorage.setItem("plan", plan);
    }, 1800);
  };

  if (success) {
    return (
      <div style={styles.success}>
        <div style={styles.successCard}>
          <h1>🎉 Payment Successful</h1>
          <p>You are now on <b>{plan.toUpperCase()}</b> plan</p>

          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* LEFT - FEATURES */}
        <div style={styles.left}>
          <h2 style={styles.title}>Plan Features</h2>
          <p style={styles.sub}>Everything included in your plan</p>

          <div style={styles.featureBox}>
            {features[plan].map((item, i) => (
              <div key={i} style={styles.featureItem}>
                ✔ {item}
              </div>
            ))}
          </div>

          <div style={styles.total}>
            Total: <b>₹{pricing[plan]}</b>
          </div>
        </div>

        {/* RIGHT - PAYMENT */}
        <div style={styles.right}>
          <h2 style={styles.title}>Checkout</h2>
          <p style={styles.sub}>
            Selected Plan: <b>{plan.toUpperCase()}</b>
          </p>

          {/* PAYMENT METHODS */}
          <div style={styles.methods}>
            <button
              onClick={() => setMethod("card")}
              style={method === "card" ? styles.active : styles.btn}
            >
              Card
            </button>

            <button
              onClick={() => setMethod("upi")}
              style={method === "upi" ? styles.active : styles.btn}
            >
              UPI
            </button>

            <button
              onClick={() => setMethod("qr")}
              style={method === "qr" ? styles.active : styles.btn}
            >
              QR
            </button>
          </div>

          {/* CARD */}
          {method === "card" && (
            <div>
              <input placeholder="Card Number" style={styles.input} />
              <input placeholder="MM/YY" style={styles.input} />
              <input placeholder="CVV" style={styles.input} />
            </div>
          )}

          {/* UPI */}
          {method === "upi" && (
            <input
              placeholder="name@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              style={styles.input}
            />
          )}

          {/* QR */}
          {method === "qr" && (
            <div style={styles.qrBox}>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi-payment"
                alt="QR"
              />
              <p style={styles.qrText}>Scan using GPay / PhonePe</p>
            </div>
          )}

          <button onClick={pay} style={styles.payBtn}>
            {loading ? "Processing..." : `Pay ₹${pricing[plan]}`}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ================= MODERN UI (MATCH HOME PAGE) ================= */

const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    background:
      "linear-gradient(180deg, #f8fafc 0%, #eef2ff 40%, #ffffff 100%)",
    minHeight: "100vh",
    padding: "80px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    display: "flex",
    gap: "25px",
    maxWidth: "1000px",
    width: "100%",
    flexWrap: "wrap",
  },

  left: {
    flex: 1,
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  right: {
    width: "340px",
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  title: {
    fontSize: "22px",
    fontWeight: "bold",
  },

  sub: {
    color: "#6b7280",
    marginBottom: "15px",
  },

  featureBox: {
    marginTop: "10px",
  },

  featureItem: {
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  },

  total: {
    marginTop: "20px",
    fontSize: "18px",
  },

  methods: {
    display: "flex",
    gap: "10px",
    margin: "15px 0",
  },

  btn: {
    flex: 1,
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "white",
    cursor: "pointer",
  },

  active: {
    flex: 1,
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "white",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },

  payBtn: {
    width: "100%",
    padding: "12px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "10px",
    marginTop: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  qrBox: {
    textAlign: "center",
    padding: "10px",
  },

  qrText: {
    fontSize: "12px",
    color: "#6b7280",
  },

  success: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(180deg, #f8fafc 0%, #eef2ff 40%, #ffffff 100%)",
  },

  successCard: {
    background: "white",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },

  primaryBtn: {
    marginTop: "15px",
    padding: "10px 15px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default Checkout;