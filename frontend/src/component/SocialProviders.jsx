import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function SocialProviders() {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log("🔄 Initiating Google Sign-In...");

      const result = await googleLogin();

      if (result.success) {
        console.log("✅ Google Sign-In Successful, navigating to dashboard");
        navigate("/dashboard");
      } else {
        // Error is handled in AuthContext but we can alert here if needed
        console.error("Link failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Google Sign-In Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
        ) : (
          <FcGoogle className="h-5 w-5 mr-2" />
        )}
        <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
      </button>
    </div>
  );
}