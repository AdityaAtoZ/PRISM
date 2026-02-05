import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { getRedirectPath } from "../utils/roles";

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        let result;
        if (isLogin) {
            result = await supabase.auth.signInWithPassword({
                email,
                password,
            });
        } else {
            result = await supabase.auth.signUp({
                email,
                password,
            });
        }

        const { error } = result;


        if (error) {
            alert(error.message);
        } else {
            const userEmail = result.data.user?.email || email;

            // If sign up returns a session (auto-confirm) OR it's login
            if (result.data.session) {
                navigate(getRedirectPath(userEmail));
            } else {
                if (!isLogin) alert("Signup successful! Please confirm your email if required, then log in.");
                else navigate(getRedirectPath(userEmail)); // Fallback, though likely covered by session check
            }
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
            <h2>{isLogin ? "Login" : "Sign Up"}</h2>
            <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: "10px", fontSize: "16px" }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: "10px", fontSize: "16px" }}
                />
                <button type="submit" disabled={loading} style={{ padding: "10px", fontSize: "16px", cursor: "pointer" }}>
                    {loading ? "Processing..." : isLogin ? "Login API" : "Sign Up API"}
                </button>
            </form>
            <p style={{ marginTop: "20px" }}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    style={{ background: "none", border: "none", color: "blue", cursor: "pointer", textDecoration: "underline" }}
                >
                    {isLogin ? "Sign Up" : "Login"}
                </button>
            </p>
        </div>
    );
}
