import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { getRedirectPath } from "../utils/roles";

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Post-login Details State
    const [showDetailsForm, setShowDetailsForm] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        let result;
        if (isLogin) {
            result = await supabase.auth.signInWithPassword({ email, password });
        } else {
            result = await supabase.auth.signUp({ email, password });
        }

        const { error, data } = result;

        if (error) {
            alert(error.message);
            setLoading(false);
        } else {
            const userEmail = data.user?.email || email;

            if (data.session) {
                // SUCCESS: Login or Auto-confirmed Signup
                // Check if we need details (Only for non-admin users)
                // We use localStorage key: 'prism_user_details_collected_<email>'
                const detailsCollected = localStorage.getItem(`prism_desc_${userEmail}`);

                if (!detailsCollected && userEmail !== 'aditya@gmail.com') { // Hardcoded Admin check or use roles util
                    setShowDetailsForm(true);
                    setLoading(false);
                } else {
                    navigate(getRedirectPath(userEmail));
                }
            } else {
                if (!isLogin) alert("Signup successful! Please confirm your email if required, then log in.");
                else navigate(getRedirectPath(userEmail)); // Should verify session really
                setLoading(false);
            }
        }
    };

    const handleSaveDetails = (e) => {
        e.preventDefault();
        // Save to LocalStorage as requested (Persistent local state)
        const userEmail = supabase.auth.getSession().then(({ data }) => data.session?.user?.email || email);

        // Use the email state as primary key since session might be async/tricky here
        localStorage.setItem(`prism_desc_${email}`, JSON.stringify({ name, phone }));
        localStorage.setItem(`prism_name_${email}`, name); // Easier access

        navigate(getRedirectPath(email));
    };

    if (showDetailsForm) {
        return (
            <div className="auth-container card">
                <div className="logo-box"><ion-icon name="person"></ion-icon></div>
                <h2>One Last Thing</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>
                    Please provide your basic details to complete profile setup.
                </p>
                <form onSubmit={handleSaveDetails}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="tel"
                        className="input-field"
                        placeholder="Phone Number (Optional)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                        Complete Setup
                    </button>
                    <div style={{ marginTop: "15px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        We only ask this once.
                    </div>
                </form>
            </div>
        )
    }

    return (
        <section id="auth-view" className="view-section active">
            <div className="auth-container card">
                <div className="logo-box"><ion-icon name="prism"></ion-icon></div>
                <h2>{isLogin ? "PRISM Secure Login" : "Create Account"}</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>
                    Payment Risk & Integrity Surveillance Module
                </p>

                <form onSubmit={handleAuth}>
                    <input
                        type="email"
                        id="emailInput"
                        className="input-field"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="input-field"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                        {loading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
                    </button>
                </form>

                <div style={{ marginTop: "20px", fontSize: "0.9rem" }}>
                    <button
                        className="btn-ghost"
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ textDecoration: "underline" }}
                    >
                        {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
                    </button>
                </div>
            </div>
        </section>
    );
}
