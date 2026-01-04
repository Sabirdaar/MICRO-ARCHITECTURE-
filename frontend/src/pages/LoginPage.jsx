import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthCard from "../component/AuthCard";
import SocialProviders from "../component/SocialProviders";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  // Clear form and errors when component mounts
  useEffect(() => {
    clearError();
    setEmail("");
    setPassword("");
  }, [clearError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Clear form on success
      setEmail("");
      setPassword("");
      navigate(from, { replace: true });
    }

    setLoading(false);
  };

  return (
    <AuthCard title="Welcome Back 👋 Log in to continue shopping">
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
            autoComplete="email"
          />
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 mt-2 rounded-md text-white font-semibold transition-all ${loading
            ? "bg-indigo-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="text-center text-sm mt-6 text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-indigo-600 font-medium hover:underline hover:text-indigo-700"
          onClick={clearError}
        >
          Sign Up
        </Link>
      </p>

      <div className="text-center text-sm text-gray-500 mt-6 mb-2">or continue with</div>
      <SocialProviders />

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </AuthCard>
  );
};

export default Login;