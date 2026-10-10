import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { User } from "../types/auth";
import {
  getCurrentUser,
  signin as signinRequest,
  signout as signoutRequest,
  signup as signupRequest
} from "../services/authService";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signin: (
    email: string,
    password: string
  ) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  signout: () => Promise<void>;
};

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function signin(
    email: string,
    password: string
  ) {
    const authenticatedUser = await signinRequest({
      email,
      password
    });

    setUser(authenticatedUser);
  }

  async function signup(
    name: string,
    email: string,
    password: string
  ) {
    const authenticatedUser = await signupRequest({
      name,
      email,
      password
    });

    setUser(authenticatedUser);
  }

  async function signout() {
    await signoutRequest();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      signin,
      signup,
      signout
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}