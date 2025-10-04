import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useAuthStore from "../store/authStore.js";

export default function VerifyOtp() {
  const { verifyOtp, resendOtp } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return setError("Please enter OTP");

    setIsLoading(true);
    setError("");

    try {
      await verifyOtp(email, otp);
      alert("Email verified successfully!");
      navigate("/login"); // redirect to login
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError("");
    try {
      await resendOtp(email);
      alert("OTP resent! Check your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full px-4 py-3 border rounded-lg"
            />
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg">
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
          <button onClick={handleResend} className="mt-4 text-green-600 hover:text-green-800">
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}
