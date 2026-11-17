"use client";

import React, {
  createContext,
  useEffect,
  useReducer,
  ReactNode,
  useState,
} from "react";

interface AuthUser {
  accessToken: string;
  email?: string;
  isAdmin?: boolean;
}

const ADMIN_SESSION_COOKIE = "adminAccessToken";

const cookieSecurity = () =>
  window.location.protocol === "https:" ? "; secure" : "";

const setAdminSessionCookie = (user: AuthUser) => {
  if (typeof document === "undefined" || user.isAdmin !== true) return;
  document.cookie = `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(user.accessToken)}; path=/admin; max-age=${60 * 60 * 24 * 3}; samesite=lax${cookieSecurity()}`;
};

const clearAdminSessionCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/admin; max-age=0; samesite=lax${cookieSecurity()}`;
};

// Define the type for the initial state
interface State {
  currentUser: AuthUser | null;
}

// Define the action types
type Action =
  | { type: "LOGIN"; payload: AuthUser }
  | { type: "LOGOUT" };

// Define the context type
interface AuthContextType {
  currentUser: State["currentUser"];
  authRestored: boolean;
  dispatch: React.Dispatch<Action>;
}

// AuthProvider component with children prop type
interface AuthProviderProps {
  children: ReactNode;
}

// Keep the server and first browser render identical; restore saved auth after hydration.
const initialState: State = { currentUser: null };

// Reducer function
const authReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "LOGIN":
      return {
        currentUser: action.payload,
      };
    case "LOGOUT":
      return {
        currentUser: null,
      };
    default:
      return state;
  }
};

// Create context
export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  authRestored: false,
  dispatch: () => {},
});

// AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [authRestored, setAuthRestored] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      if (parsed && typeof parsed.accessToken === "string") {
        dispatch({ type: "LOGIN", payload: parsed });
      } else if (storedUser) {
        localStorage.removeItem("currentUser");
      }
    } catch {
      localStorage.removeItem("currentUser");
    } finally {
      setAuthRestored(true);
    }
  }, []);

  useEffect(() => {
    if (!authRestored) return;
    if (typeof window !== "undefined") {
      if (state.currentUser) {
        localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
        setAdminSessionCookie(state.currentUser);
      } else {
        localStorage.removeItem("currentUser");
        clearAdminSessionCookie();
      }
    }
  }, [authRestored, state.currentUser]);

  return (
    <AuthContext.Provider
      value={{ currentUser: state.currentUser, authRestored, dispatch }}
    >
      {children}
    </AuthContext.Provider>
  );
};
