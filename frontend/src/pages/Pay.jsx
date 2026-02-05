import { useState, useEffect } from "react";
import api from "../services/api";
import { supabase } from "../services/supabaseClient";

export default function Pay() {
  const [userEmail, setUserEmail] = useState(""); // Simplified: Name stored via email key logic in Auth
  const [userName, setUserName] = useState("User");

  // Payment State
  const [payee, setPayee] = useState(null);
  const [amount, setAmount] = useState("");
  const [accountAge, setAccountAge] = useState("");
  const [recentTx, setRecentTx] = useState("");
  const [sameAmount, setSameAmount] = useState("");

  // UI State
  const [activeView, setActiveView] = useState("home"); // home, history, etc
  const [isPaymentOverlayOpen, setPaymentOverlayOpen] = useState(false);
  const [riskResult, setRiskResult] = useState(null); // The full risk object
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [history, setHistory] = useState([
    { title: "Gym Fees", date: "Today, 10:00 AM", amount: "- ₹ 1,500", type: "debit" },
    { title: "Salary", date: "Yesterday", amount: "+ ₹ 45,000", type: "credit" }
  ]);

  const contacts = [
    { id: 1, name: "Anita Roy", phone: "+91 98765 43210", img: "44" },
    { id: 2, name: "Grocery Store", phone: "+91 88888 22222", img: "33" },
    { id: 3, name: "Ravi Kumar", phone: "+91 77777 11111", img: "11" },
    { id: 5, name: "Crypto Hub", phone: "Unknown", img: "60" }
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const email = data.session.user.email;
        setUserEmail(email);
        const storedName = localStorage.getItem(`prism_name_${email}`);
        if (storedName) setUserName(storedName);
        else setUserName(email.split('@')[0]);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const startPayment = (name) => {
    setPayee(name);
    setAmount("");
    setAccountAge("");
    setRecentTx("");
    setSameAmount("");
    setPaymentOverlayOpen(true);
  };

  const closePayment = () => {
    setPaymentOverlayOpen(false);
    setShowRiskModal(false);
    setRiskResult(null);
  };

  const processPayment = async () => {
    if (!amount) return alert("Enter amount");

    // Call API
    try {
      const payload = {
        amount: Number(amount),
        account_age_days: Number(accountAge) || 365, // Default safe if empty
        recent_tx_count: Number(recentTx) || 0,
        same_amount_count: Number(sameAmount) || 0,
      };
      const res = await api.post("/payment/initiate", payload);
      const risk = res.data.risk;

      setRiskResult(risk);

      if (risk.risk_level !== "LOW") {
        setShowRiskModal(true);
      } else {
        executeSuccess();
      }
    } catch (e) {
      alert("Payment Failed: " + e.message);
    }
  };

  const confirmPay = () => {
    setShowRiskModal(false);
    executeSuccess();
  };

  const executeSuccess = () => {
    setShowSuccessScreen(true);
    // Add to local history
    setHistory(prev => [{
      title: payee,
      date: "Just now",
      amount: "- ₹ " + Number(amount).toLocaleString(),
      type: "debit"
    }, ...prev]);

    setTimeout(() => {
      setShowSuccessScreen(false);
      closePayment();
    }, 2500);
  };

  return (
    <section id="mobile-view" className="view-section active">
      <div className="phone-frame">

        {/* Mobile Home Tab */}
        <div className={`m-content ${activeView === 'home' ? 'active' : ''}`}>
          <div className="m-header">
            <div className="user-info-area">
              <small style={{ color: "var(--text-secondary)" }}>Hello,</small>
              <h3>{userName}</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="avatar" style={{ backgroundImage: "url('https://i.pravatar.cc/150?img=12')" }}></div>
              <button className="btn-ghost" onClick={handleLogout} title="Log Out" style={{ padding: "8px" }}>
                <ion-icon name="log-out-outline" style={{ fontSize: "1.6rem" }}></ion-icon>
              </button>
            </div>
          </div>

          <div className="m-balance" onClick={() => setActiveView('history')}>
            <small>Available Balance</small>
            <h2>₹ 24,500</h2>
            <ion-icon name="wallet-outline" style={{ position: "absolute", right: "20px", top: "20px", fontSize: "2rem", opacity: "0.2" }}></ion-icon>
          </div>

          <div className="m-actions">
            <div className="action-btn">
              <div className="action-icon"><ion-icon name="qr-code-outline"></ion-icon></div>
              <span>Scan</span>
            </div>
            <div className="action-btn">
              <div className="action-icon"><ion-icon name="person-outline"></ion-icon></div>
              <span>Contact</span>
            </div>
            <div className="action-btn">
              <div className="action-icon"><ion-icon name="refresh-outline"></ion-icon></div>
              <span>Self</span>
            </div>
            <div className="action-btn" onClick={() => setActiveView('history')}>
              <div className="action-icon"><ion-icon name="grid-outline"></ion-icon></div>
              <span>History</span>
            </div>
          </div>

          <div className="section-title">Recent Payees</div>
          <div className="recent-scroll">
            {contacts.slice(0, 3).map(c => (
              <div key={c.id} className="recent-item" onClick={() => startPayment(c.name)}>
                <div className="avatar" style={{ backgroundImage: `url('https://i.pravatar.cc/150?img=${c.img}')` }}></div>
                <span style={{ fontSize: "0.75rem" }}>{c.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>

          <div className="section-title">All Contacts</div>
          <div className="contact-list">
            {contacts.map(c => (
              <div key={c.id} className="contact-row" onClick={() => startPayment(c.name)}>
                <div className="avatar" style={{ backgroundImage: `url('https://i.pravatar.cc/150?img=${c.img}')` }}></div>
                <div className="contact-info">
                  <h4>{c.name}</h4>
                  <p>{c.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History View */}
        <div className={`m-content ${activeView === 'history' ? 'active' : ''}`}>
          <div style={{ padding: "20px", background: "white", display: "flex", alignItems: "center", gap: "15px", borderBottom: "1px solid #f0f0f0" }}>
            <button className="btn-ghost" onClick={() => setActiveView('home')}><ion-icon name="arrow-back" style={{ fontSize: "1.5rem" }}></ion-icon></button>
            <h3>Transaction History</h3>
          </div>
          <div style={{ padding: "20px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {history.map((h, i) => (
              <div key={i} className="contact-row" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <div style={{ width: "40px", height: "40px", background: "#f3f4f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                    <ion-icon name={h.type === 'credit' ? 'arrow-down' : 'arrow-up'}></ion-icon>
                  </div>
                  <div>
                    <h4>{h.title}</h4>
                    <p>{h.date}</p>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: h.type === 'credit' ? 'var(--success)' : 'var(--text-primary)' }}>{h.amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Overlay */}
        {isPaymentOverlayOpen && (
          <div className="payment-overlay" style={{ display: 'flex' }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <button className="btn-ghost" onClick={closePayment}><ion-icon name="arrow-back" style={{ fontSize: "1.5rem" }}></ion-icon></button>
              <div>
                <small>Paying to</small>
                <h4>{payee}</h4>
              </div>
            </div>

            <div className="pay-input-container">
              <small>Enter Amount</small>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "2rem", fontWeight: 700 }}>₹</span>
                <input type="number" className="pay-amount" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>

              {/* Hidden Tech Params for Demo */}
              <div style={{ marginTop: "30px", width: "100%", background: "#f9f9f9", padding: "15px", borderRadius: "12px" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "10px", fontWeight: "bold" }}>Demo Payment Context</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input className="input-field" placeholder="Acc Age (Days)" style={{ margin: 0, fontSize: "0.9rem", padding: "8px" }} value={accountAge} onChange={e => setAccountAge(e.target.value)} />
                  <input className="input-field" placeholder="Recent Tx Count" style={{ margin: 0, fontSize: "0.9rem", padding: "8px" }} value={recentTx} onChange={e => setRecentTx(e.target.value)} />
                  <input className="input-field" placeholder="Same Amt Count" style={{ margin: 0, fontSize: "0.9rem", padding: "8px" }} value={sameAmount} onChange={e => setSameAmount(e.target.value)} />
                </div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: "100%", padding: "18px" }} onClick={processPayment}>
              Proceed to Pay
            </button>
          </div>
        )}

        {/* Risk Warning Modal */}
        <div className={`bottom-modal ${showRiskModal ? 'show' : ''}`}>
          <div className="modal-icon icon-risk"><ion-icon name="warning"></ion-icon></div>
          <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Unusual Activity Detected</h3>

          {riskResult && (
            <div style={{ background: "#fff7ed", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "0.85rem" }}>
              <strong>Reason:</strong> {Array.isArray(riskResult.reasons) ? riskResult.reasons.join(", ") : riskResult.reasons}
              <br />
              <strong>Risk Score:</strong> {riskResult.risk_score} ({riskResult.risk_level})
            </div>
          )}

          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px", lineHeight: "1.5" }}>
            PRISM flags high risk. Proceed only if you trust this receiver.
          </p>
          <button className="btn btn-danger" style={{ width: "100%", marginBottom: "12px" }} onClick={confirmPay}>Yes, I Trust Them</button>
          <button className="btn btn-ghost" style={{ width: "100%" }} onClick={closePayment}>Cancel Transaction</button>
        </div>

        {/* Success Screen */}
        {showSuccessScreen && (
          <div className="success-screen">
            <div style={{ width: "80px", height: "80px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)", fontSize: "3rem", marginBottom: "20px" }}>
              <ion-icon name="checkmark"></ion-icon>
            </div>
            <h2>Payment Successful</h2>
            <h1 style={{ marginTop: "20px" }}>₹ {Number(amount).toLocaleString()}</h1>
          </div>
        )}

      </div>
    </section>
  );
}
