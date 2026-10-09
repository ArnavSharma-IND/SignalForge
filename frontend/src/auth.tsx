import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, fbSignOut, isAuthDisabled } from "./firebase";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthDisabled: boolean;
  isVerified: boolean;
  signOut: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEV_USER: any = {
  uid: "dev-user",
  email: "dev@signalforge.ai",
  emailVerified: true,
  displayName: "Dev Analyst",
  phoneNumber: null,
  photoURL: null,
  getIdToken: async () => "dev-token",
  reload: async () => {},
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(isAuthDisabled ? DEV_USER : null);
  const [loading, setLoading] = useState<boolean>(!isAuthDisabled);

  useEffect(() => {
    if (isAuthDisabled) {
      setUser(DEV_USER);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (isAuthDisabled) {
      setUser(null);
      return;
    }
    await fbSignOut(auth);
  };

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  const isVerified = Boolean(
    isAuthDisabled || user?.emailVerified || user?.phoneNumber
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthDisabled,
        isVerified,
        signOut,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function ProtectedRoute({
  children,
  requireVerified = true,
}: {
  children: ReactNode;
  requireVerified?: boolean;
}) {
  const { user, loading, isVerified, isAuthDisabled } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  if (!user && !isAuthDisabled) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireVerified && !isVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
