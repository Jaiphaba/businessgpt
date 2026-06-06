import { useEffect, useState } from "react";
import {
  getBusinessPlans,
  deleteBusinessPlan,
} from "../services/planService";
import ReactMarkdown from "react-markdown";

function History() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const data = await getBusinessPlans();
      setPlans(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteBusinessPlan(id);

      // remove from UI instantly
      const updated = plans.filter((p) => p.id !== id);
      setPlans(updated);

      if (selectedPlan?.id === id) {
        setSelectedPlan(null);
      }
    } catch (error) {
      alert("Failed to delete plan");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* SIDEBAR */}
      <div
        style={{
          width: "320px",
          borderRight: "1px solid #e5e7eb",
          padding: "20px",
        }}
      >
        <h2>📁 Saved Plans</h2>

        {loading && <p>Loading...</p>}

        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              padding: "12px",
              marginBottom: "10px",
              background: "#f3f4f6",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <div onClick={() => setSelectedPlan(plan)}>
              <strong>
                {plan.prompt?.substring(0, 35) || "Untitled"}
              </strong>
            </div>

            <button
              onClick={() => handleDelete(plan.id)}
              style={{
                marginTop: "8px",
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: "30px" }}>
        {selectedPlan ? (
          <>
            <h1>Business Plan</h1>

            <ReactMarkdown>{selectedPlan.plan}</ReactMarkdown>
          </>
        ) : (
          <h2>Select a plan</h2>
        )}
      </div>
    </div>
  );
}

export default History;