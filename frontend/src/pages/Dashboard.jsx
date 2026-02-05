import { useEffect, useState } from "react";
import api from "../services/api";
import { supabase } from "../services/supabaseClient";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [risks, setRisks] = useState([]);
  const [engine, setEngine] = useState("RULE");
  const [activeTab, setActiveTab] = useState("analytics"); // analytics, users, rules

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

    // Auto-refresh every 5 seconds for "Live Feed" feel
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleEngineChange = async (newEngine) => {
    setEngine(newEngine);
    await api.post("/dashboard/config/set-engine", { engine: newEngine });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <section id="desktop-view" className="view-section active" style={{ display: "flex" }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-box" style={{ width: "40px", height: "40px", fontSize: "1.2rem", marginBottom: "40px" }}><ion-icon name="prism"></ion-icon></div>

        <div className={`nav-icon ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')} data-tooltip="Analytics">
          <ion-icon name="analytics-outline"></ion-icon>
        </div>

        <div className={`nav-icon ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')} data-tooltip="User Network">
          <ion-icon name="people-outline"></ion-icon>
        </div>

        <div className={`nav-icon ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')} data-tooltip="Detection Rules">
          <ion-icon name="shield-checkmark-outline"></ion-icon>
        </div>

        <div className="nav-icon" style={{ marginTop: "auto" }} onClick={handleLogout} title="Log Out">
          <ion-icon name="log-out-outline"></ion-icon>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Surveillance Dashboard</h1>
            <p style={{ color: "var(--text-secondary)" }}>Real-time payment integrity monitoring • <span style={{ color: "var(--success)", fontWeight: 600 }}>● System Active</span></p>
          </div>

          {/* Engine Switcher in Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px", background: "white", padding: "10px 20px", borderRadius: "30px", boxShadow: "var(--shadow-soft)" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)" }}>ENGINE:</span>
            <select
              value={engine}
              onChange={(e) => handleEngineChange(e.target.value)}
              style={{ border: "none", fontWeight: 700, outline: "none", cursor: "pointer", background: "transparent", fontSize: "0.9rem" }}
            >
              <option value="RULE">Rule-Based</option>
              <option value="ML">ML-Based (Beta)</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Analytics */}
        {activeTab === 'analytics' && (
          <div className="d-tab-content active" style={{ display: "flex" }}>
            {/* Top Metrics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-val">₹ 42.5L</div>
                <div className="stat-label">Total Volume (24h)</div>
              </div>
              <div className="stat-card">
                <div className="stat-val">{transactions.length}</div>
                <div className="stat-label">Transactions</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{ color: "var(--danger)" }}>{risks.filter(r => r.risk_level === 'HIGH').length}</div>
                <div className="stat-label">High Risk Events</div>
              </div>
              <div className="stat-card">
                <div className="stat-val">{engine}</div>
                <div className="stat-label">Active Engine</div>
              </div>
            </div>

            {/* Split View */}
            <div className="content-split">
              {/* Live Feed */}
              <div className="live-feed-card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <h3>Live Transaction Feed</h3>
                  <button className="btn-ghost" style={{ fontSize: "0.9rem" }}><ion-icon name="refresh"></ion-icon> Sync</button>
                </div>
                <div className="table-header">
                  <span>TXN ID</span>
                  <span>FROM / TO</span>
                  <span>AMOUNT</span>
                  <span>DETAILS</span>
                </div>
                <div className="feed-scroll">
                  {transactions.length === 0 ? <p style={{ padding: "20px", color: "#ccc", textAlign: "center" }}>No transactions yet...</p> : null}
                  {transactions.slice().reverse().map((tx) => (
                    <div key={tx.id} className="feed-row" style={{ cursor: "default" }}>
                      <span style={{ fontFamily: "monospace" }}>#{tx.id}</span>
                      <span>{tx.sender_id} → {tx.receiver_id}</span>
                      <span style={{ fontWeight: 600 }}>₹ {tx.amount.toLocaleString()}</span>
                      <span className="badge badge-neutral">Processed</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Logs (Replacing Map for utility) */}
              <div className="risk-map-card">
                <h3>Risk & Security Logs</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Recent flags from detection engine</p>

                <div className="feed-scroll" style={{ marginTop: "15px" }}>
                  {risks.length === 0 ? <p style={{ padding: "20px", color: "#ccc", textAlign: "center" }}>System Secure</p> : null}
                  {risks.slice().reverse().map(risk => (
                    <div key={risk.id} style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                        <span style={{ fontWeight: "bold" }}>{risk.risk_level}</span>
                        <span>Score: {risk.risk_score}</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                        {Array.isArray(risk.reasons) ? risk.reasons.join(", ") : risk.reasons}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users (Static Placeholder from HTML) */}
        {activeTab === 'users' && (
          <div className="live-feed-card" style={{ height: "100%" }}>
            <h3>User Network Analysis</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Database of flagged and monitored entities.</p>
            <div className="table-header">
              <span>ENTITY NAME</span>
              <span>ACCOUNT ID</span>
              <span>RISK TIER</span>
              <span>STATUS</span>
            </div>
            <div className="feed-scroll">
              <div className="feed-row">
                <span><ion-icon name="business" style={{ verticalAlign: "middle" }}></ion-icon> Crypto Hub</span>
                <span style={{ fontFamily: "monospace" }}>#ACC-9912</span>
                <span style={{ color: "var(--danger)", fontWeight: 700 }}>Critical</span>
                <span className="badge badge-risk">Watchlist</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Rules (Static Placeholder from HTML) */}
        {activeTab === 'rules' && (
          <div className="live-feed-card" style={{ height: "100%" }}>
            <h3>Detection Rules Configuration</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Active algorithms monitoring payment integrity.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #eee" }}>
                <div>
                  <h4>Velocity Check (High Frequency)</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Flags &gt;5 transactions in 1 hour from same device.</p>
                </div>
                <span className="badge badge-safe">Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
