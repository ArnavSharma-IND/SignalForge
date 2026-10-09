import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile,
  type ConfirmationResult,
} from "firebase/auth";
import { auth, googleProvider, isAuthDisabled } from "./firebase";
import { useAuth } from "./auth";
import { api } from "./api";
import { Btn, Card, Badge, cn } from "./ui";
import {
  Shield,
  KeyRound,
  Mail,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  LogOut,
  RefreshCw,
} from "lucide-react";

const inpClass =
  "w-full rounded-sm border border-ivory/15 bg-surf/80 px-3.5 py-2.5 text-sm text-ivory placeholder-warm outline-none transition focus:border-gold focus:ring-1 focus:ring-gold";

export function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();
  const { isAuthDisabled } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isAuthDisabled) {
        await signInWithEmailAndPassword(auth, email, password);
      }
      nav("/research");
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isAuthDisabled) {
        await signInWithPopup(auth, googleProvider);
      }
      nav("/research");
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Card className="border-ivory/20 bg-char/90 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
            <KeyRound className="text-gold" size={22} />
          </div>
          <h1 className="font-display text-3xl">Sign in to SignalForge</h1>
          <p className="mt-1 text-xs text-mute">Access institutional research and intelligence dossiers</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-mute">Work Email</label>
            <input
              type="email"
              required
              className={inpClass}
              placeholder="analyst@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-medium text-mute">Password</label>
              <Link to="/forgot-password" className="text-xs text-gold hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              className={inpClass}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Btn type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : "SIGN IN"}
          </Btn>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ivory/10" />
          </div>
          <span className="relative bg-char px-3 text-xs text-warm">OR CONTINUE WITH</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Btn variant="ghost" className="w-full text-xs" onClick={handleGoogleSignIn} disabled={loading}>
            Google
          </Btn>
          <Btn variant="ghost" className="w-full text-xs" onClick={() => nav("/phone-login")} disabled={loading}>
            <Phone size={14} /> Phone Code
          </Btn>
        </div>

        <p className="mt-6 text-center text-xs text-mute">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-gold hover:underline">
            Register here
          </Link>
        </p>
      </Card>
    </main>
  );
}

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (!isAuthDisabled) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCred.user, { displayName: name });
        }
        await sendEmailVerification(userCred.user);
      }
      nav("/verify-email");
    } catch (err: any) {
      setError(err?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Card className="border-ivory/20 bg-char/90 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
            <Shield className="text-gold" size={22} />
          </div>
          <h1 className="font-display text-3xl">Create an Account</h1>
          <p className="mt-1 text-xs text-mute">Institutional research platform</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-mute">Full Name</label>
            <input
              type="text"
              required
              className={inpClass}
              placeholder="Alex Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-mute">Work Email</label>
            <input
              type="email"
              required
              className={inpClass}
              placeholder="analyst@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-mute">Password</label>
            <input
              type="password"
              required
              className={inpClass}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-mute">Confirm Password</label>
            <input
              type="password"
              required
              className={inpClass}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Btn type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : "CREATE ACCOUNT"}
          </Btn>
        </form>

        <p className="mt-6 text-center text-xs text-mute">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}

export function PhoneLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    return () => {
      // Clean up recaptcha if needed
    };
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isAuthDisabled) {
        setStep("code");
        setLoading(false);
        return;
      }
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      setStep("code");
    } catch (err: any) {
      setError(err?.message || "Failed to send SMS verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isAuthDisabled && confirmationResult) {
        await confirmationResult.confirm(verificationCode);
      }
      nav("/research");
    } catch (err: any) {
      setError(err?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Card className="border-ivory/20 bg-char/90 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
            <Phone className="text-gold" size={22} />
          </div>
          <h1 className="font-display text-3xl">Phone Sign-In</h1>
          <p className="mt-1 text-xs text-mute">Secure SMS verification authentication</p>
        </div>

        <div id="recaptcha-container" />

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-mute">Phone Number (with country code)</label>
              <input
                type="tel"
                required
                className={inpClass}
                placeholder="+1 555 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Btn type="submit" className="w-full" disabled={loading || !phoneNumber}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "SEND CODE"}
            </Btn>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-mute">6-Digit SMS Verification Code</label>
              <input
                type="text"
                required
                className={cn(inpClass, "text-center tracking-widest text-lg font-mono")}
                placeholder="123456"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
            <Btn type="submit" className="w-full" disabled={loading || !verificationCode}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "VERIFY & SIGN IN"}
            </Btn>
            <button
              type="button"
              className="w-full text-center text-xs text-gold hover:underline"
              onClick={() => setStep("phone")}
            >
              ← Back to phone number
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-mute">
          Prefer email?{" "}
          <Link to="/login" className="font-medium text-gold hover:underline">
            Email Sign In
          </Link>
        </p>
      </Card>
    </main>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isAuthDisabled) {
        await sendPasswordResetEmail(auth, email);
      }
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Card className="border-ivory/20 bg-char/90 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
            <Mail className="text-gold" size={22} />
          </div>
          <h1 className="font-display text-3xl">Reset Password</h1>
          <p className="mt-1 text-xs text-mute">We'll send you an email instructions link</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 size={18} />
              <span>Password reset email dispatched</span>
            </div>
            <p className="text-xs text-mute">
              Check your inbox for <strong>{email}</strong> and follow the instructions.
            </p>
            <Btn variant="ghost" className="w-full mt-4" onClick={() => setSent(false)}>
              Send another email
            </Btn>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-mute">Work Email</label>
              <input
                type="email"
                required
                className={inpClass}
                placeholder="analyst@firm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Btn type="submit" className="w-full" disabled={loading || !email}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "SEND RESET EMAIL"}
            </Btn>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-mute">
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}

export function VerifyEmailPage() {
  const { user, reloadUser, isAuthDisabled } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  const handleResend = async () => {
    if (isAuthDisabled || !auth.currentUser) return;
    setError(null);
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage("Verification email has been resent. Please check your inbox.");
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    setLoading(true);
    try {
      await reloadUser();
      if (auth.currentUser?.emailVerified || isAuthDisabled) {
        nav("/research");
      } else {
        setMessage("Email is not verified yet. Please click the link in your email.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to refresh user status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Card className="border-ivory/20 bg-char/90 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
          <Mail className="text-gold" size={22} />
        </div>
        <h1 className="font-display text-3xl">Verify Your Email</h1>
        <p className="mt-2 text-xs text-mute">
          To protect institutional research data, email verification is required before running investigations.
        </p>

        <div className="my-6 rounded bg-surf/90 p-4 text-xs font-mono text-ivory/90">
          {user?.email || "analyst@firm.com"}
        </div>

        {message && (
          <div className="mb-4 flex items-center justify-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center justify-center gap-2 text-xs text-rose-400">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          <Btn onClick={handleCheck} className="w-full" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><RefreshCw size={14} /> I'VE VERIFIED MY EMAIL</>}
          </Btn>
          <Btn variant="ghost" onClick={handleResend} className="w-full text-xs" disabled={loading}>
            Resend Verification Link
          </Btn>
        </div>

        <p className="mt-6 text-xs text-warm">
          Already verified?{" "}
          <Link to="/research" className="text-gold hover:underline">
            Go to Research
          </Link>
        </p>
      </Card>
    </main>
  );
}

export function AccountPage() {
  const { user, signOut, isAuthDisabled } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  const handleDeleteAccount = async () => {
    setError(null);
    setDeleting(true);
    try {
      await api.deleteMe();
      if (!isAuthDisabled && auth.currentUser) {
        await auth.currentUser.delete();
      }
      await signOut();
      nav("/");
    } catch (err: any) {
      setError(err?.message || "Failed to delete account. You may need to re-login recently to confirm.");
      setDeleting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-4xl">Account Settings</h1>
      <p className="mt-2 text-sm text-mute">Manage identity, security, and data privacy</p>

      <div className="mt-8 space-y-6">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">User Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <div className="text-xs text-warm">User ID (UID)</div>
              <div className="font-mono text-xs text-ivory/90 mt-0.5">{user?.uid || "dev-user"}</div>
            </div>
            <div>
              <div className="text-xs text-warm">Email Address</div>
              <div className="text-ivory mt-0.5">{user?.email || "dev@signalforge.ai"}</div>
            </div>
            <div>
              <div className="text-xs text-warm">Email Verification Status</div>
              <div className="mt-1">
                {user?.emailVerified || isAuthDisabled ? (
                  <Badge tone="green">Verified</Badge>
                ) : (
                  <Badge tone="amber">Unverified</Badge>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-warm">Phone Number</div>
              <div className="text-ivory mt-0.5">{user?.phoneNumber || "Not registered"}</div>
            </div>
          </div>

          <div className="pt-2">
            <Btn variant="ghost" onClick={async () => { await signOut(); nav("/login"); }} className="text-xs">
              <LogOut size={14} /> SIGN OUT
            </Btn>
          </div>
        </Card>

        <Card className="border-rose-500/30 bg-rose-500/5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-rose-300">Danger Zone</h2>
            <p className="text-xs text-mute mt-1">
              Deleting your account permanently wipes all your research investigations, evidence trails, and profile identity.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!confirmDelete ? (
            <Btn
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              className="border-rose-500/40 text-rose-300 hover:bg-rose-500/15"
            >
              <Trash2 size={15} /> DELETE ACCOUNT & DATA
            </Btn>
          ) : (
            <div className="space-y-3 rounded border border-rose-500/40 bg-char p-4">
              <p className="text-xs font-semibold text-rose-300">
                Are you absolutely sure? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Btn
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-rose-600 text-white hover:bg-rose-700"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : "YES, DELETE EVERYTHING"}
                </Btn>
                <Btn
                  variant="ghost"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="text-xs"
                >
                  Cancel
                </Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
