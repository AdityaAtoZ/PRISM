import { useEffect, useState } from "react";
import api from "../services/api";
import { supabase } from "../services/supabaseClient";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [risks, setRisks] = useState([]);
  const [engine, setEngine] = useState("RULE");

  const refreshData = () => {
    api.get("/dashboard/transactions")
      .then(res => setTransactions(res.data));

    api.get("/dashboard/risks")
      .then(res => setRisks(res.data));
  };

  useEffect(() => {
    refreshData();
    api.get("/dashboard/config/engine")
      .then(res => setEngine(res.data.engine));
  }, []);

  const handleEngineChange = async (e) => {
    const newEngine = e.target.value;
    setEngine(newEngine);
    await api.post("/dashboard/config/set-engine", { engine: newEngine });
  };

  return (
    <div style={{ padding: "20px" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>PRISM – Admin Dashboard</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div>
            <label style={{ marginRight: "10px", fontWeight: "bold" }}>Detection Engine:</label>
            <select value={engine} onChange={handleEngineChange} style={{ padding: "5px" }}>
              <option value="RULE">Rule-Based</option>
              <option value="ML">ML-Based (Beta)</option>
            </select>
          </div>
          <button onClick={async () => await supabase.auth.signOut()} style={{ padding: "5px 10px", cursor: "pointer", background: "#f44336", color: "white", border: "none", borderRadius: "4px" }}>
            Logout
          </button>
        </div>
      </div>

      <h3>Transactions</h3>
      <ul>
        {transactions.map(tx => (
          <li key={tx.id}>
            {tx.sender_id} → {tx.receiver_id} | ₹{tx.amount}
          </li>
        ))}
      </ul>

      <h3>Risk Logs</h3>
      <ul>
        {risks.map(risk => (
          <li key={risk.id}>
            <strong>{risk.risk_level}</strong> | Score: {risk.risk_score} <br />
            <small>{Array.isArray(risk.reasons) ? risk.reasons.join(", ") : risk.reasons}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
