import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./services/supabaseClient";
import Auth from "./pages/Auth";
import Pay from "./pages/Pay";
import Dashboard from "./pages/Dashboard";
import { getRedirectPath, isAdmin } from "./utils/roles";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>

        {/* ... inside Routes */}
        <Route
          path="/"
          element={!session ? <Auth /> : <Navigate to={getRedirectPath(session.user.email)} />}
        />
        <Route
          path="/pay"
          element={
            session ? (
              !isAdmin(session.user.email) ? <Pay /> : <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            session ? (
              isAdmin(session.user.email) ? <Dashboard /> : <Navigate to="/pay" />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
