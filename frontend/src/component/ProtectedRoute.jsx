import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: "Please log in to access the dashboard"
        }}
        replace
      />
    );
  }

  // Optional: Remove or keep email verification check based on your preference
  // if (currentUser && !currentUser.emailVerified) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
  //         <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
  //         <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Not Verified</h2>
  //         <p className="text-gray-600 mb-6">
  //           Please verify your email address to access the dashboard.
  //         </p>
  //         <button
  //           onClick={() => currentUser.sendEmailVerification()}
  //           className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
  //         >
  //           Resend Verification Email
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return children;
}