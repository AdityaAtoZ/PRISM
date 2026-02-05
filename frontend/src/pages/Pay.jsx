import { useState } from "react";
import api from "../services/api";
import { supabase } from "../services/supabaseClient";

export default function Pay() {
  const [amount, setAmount] = useState("");
  const [accountAge, setAccountAge] = useState("");
  const [recentTx, setRecentTx] = useState("");
  const [sameAmount, setSameAmount] = useState("");
  const [result, setResult] = useState(null);

  const handlePay = async () => {
    const payload = {
      amount: Number(amount),
      account_age_days: Number(accountAge),
      recent_tx_count: Number(recentTx),
      same_amount_count: Number(sameAmount),
    };

    const res = await api.post("/payment/initiate", payload);
    setResult(res.data.risk);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Fake Payment</h2>
        <button onClick={handleLogout} style={{ padding: "5px 10px", cursor: "pointer", background: "#f44336", color: "white", border: "none", borderRadius: "4px" }}>
          Logout
        </button>
      </div>

      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      /><br /><br />

      <input
        placeholder="Receiver Account Age (days)"
        value={accountAge}
        onChange={(e) => setAccountAge(e.target.value)}
      /><br /><br />

      <input
        placeholder="Recent Transactions Count"
        value={recentTx}
        onChange={(e) => setRecentTx(e.target.value)}
      /><br /><br />

      <input
        placeholder="Same Amount Count"
        value={sameAmount}
        onChange={(e) => setSameAmount(e.target.value)}
      /><br /><br />

      <button onClick={handlePay}>Pay</button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Risk Result</h3>
          <p>Level: {result.risk_level}</p>
          <p>Score: {result.risk_score}</p>
          <ul>
            {result.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
