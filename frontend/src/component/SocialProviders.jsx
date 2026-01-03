import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";

export default function SocialProviders() {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services
    const loadGoogleScript = () => {
      if (window.google) {
        setGoogleLoaded(true);
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleLoaded(true);
        initializeGoogleSignIn();
      };
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
          }
        );
      }
    };

    loadGoogleScript();
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    try {
      setLoading(true);
      console.log("🔄 Processing Google Sign-In...");

      const { credential } = response; // This is the JWT ID token
      const decoded = jwtDecode(credential);
      const { email, given_name, family_name } = decoded;

      const result = await googleLogin(credential, email, given_name, family_name);

      if (result.success) {
        console.log("✅ Google Sign-In Successful");
        navigate("/dashboard");
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("❌ Google Sign-In Error:", error);
      alert("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center">
      <div
        ref={googleButtonRef}
        className={loading ? 'opacity-50 pointer-events-none' : ''}
      />
      {loading && (
        <div className="flex items-center justify-center gap-3 text-gray-600 mt-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
          <span className="text-sm">Signing in...</span>
        </div>
      )}
    </div>
  );
}