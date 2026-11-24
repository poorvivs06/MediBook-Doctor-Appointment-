import { createContext, useContext, useState, useEffect } from "react";
import {
  supabase,
  isSupabaseConfigured,
  signInUser,
  signUpUser,
  signOutUser,
} from "./supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync initial user state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          // Check Supabase session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              fullName:
                session.user.user_metadata?.full_name ||
                session.user.email.split("@")[0],
              role: session.user.user_metadata?.role || "patient",
              provider: "supabase",
            });
          }
        } else {
          // Check local storage session
          const saved = localStorage.getItem("medibook_current_user");
          if (saved && mounted) {
            try {
              const parsed = JSON.parse(saved);
              setUser({
                id: parsed.id,
                email: parsed.email,
                fullName:
                  parsed.fullName ||
                  parsed.user_metadata?.full_name ||
                  parsed.email.split("@")[0],
                role: parsed.role || parsed.user_metadata?.role || "patient",
                provider: "local",
              });
            } catch {
              localStorage.removeItem("medibook_current_user");
            }
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Set up Supabase auth listener if configured
    let authListener = null;
    if (isSupabaseConfigured && supabase) {
      const { data: subscription } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              fullName:
                session.user.user_metadata?.full_name ||
                session.user.email.split("@")[0],
              role: session.user.user_metadata?.role || "patient",
              provider: "supabase",
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );
      authListener = subscription;
    }

    return () => {
      mounted = false;
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await signInUser({ email, password });
      setUser({
        id: res.user.id,
        email: res.user.email,
        fullName:
          res.user.user_metadata?.full_name ||
          res.user.fullName ||
          res.user.email.split("@")[0],
        role: res.user.user_metadata?.role || "patient",
        provider: res.provider,
      });
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await signUpUser(userData);
      // If local or direct session returned
      if (res.session?.user) {
        setUser({
          id: res.session.user.id,
          email: res.session.user.email,
          fullName:
            res.session.user.user_metadata?.full_name ||
            userData.fullName ||
            res.session.user.email.split("@")[0],
          role: "patient",
          provider: res.provider,
        });
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
