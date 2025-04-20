"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FcGoogle } from "react-icons/fc";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        return;
      }
      if (data?.session?.user) {
        router.push("/dashboard");
      }
    };

    checkUserSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
  
    const toastId = toast.loading("Signing in...");
  
    setLoading(true);
    setError(null);
  
    const { error } = await supabase.auth.signInWithPassword({ email, password });
  
    if (error) {
      toast.error(error.message, { id: toastId });
      setLoading(false);
      return;
    }
  
    toast.success("Login successful", { id: toastId });
    router.push("/dashboard");
  };  

  const handleGoogleLogin = async () => {
    const toastId = toast.loading("Redirecting to Google...");
  
    setLoading(true);
    setError(null);
  
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  
    setLoading(false);
  
    if (error) {
      toast.error(error.message, { id: toastId });
    } else {
      toast.success("Redirecting...", { id: toastId });
    }
  };  

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#4ade80",
              secondary: "#1e3a8a",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87171",
              secondary: "#1e3a8a",
            },
          },
        }}
      />
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left Section (Illustration) */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-blue-600 text-white p-6 relative">
          <Image
            src="/side_image.png"
            alt="Illustration"
            width={500}
            height={500}
            className="w-3/4"
          />
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white px-6">
          <h1 className="text-3xl font-bold mb-4 text-black">
            Welcome back <span className="text-blue-600">CallLive.ai!</span>
          </h1>
          <p className="text-gray-600 mb-6">It's great to see you again</p>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center justify-center w-80 bg-white border border-gray-300 text-black font-semibold py-2 rounded-full shadow-md hover:bg-gray-100 mb-3"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="w-80 text-center text-gray-500 my-2">OR</div>

          {/* Email Input */}
          <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 w-80 mb-2">
            <FaEnvelope className="text-gray-500 mr-3" />
            <input
              type="email"
              placeholder="Enter your email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full outline-none bg-transparent"
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 w-80 mb-4 relative">
            <FaLock className="text-gray-500 mr-3" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none bg-transparent pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-gray-500 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-80 bg-blue-600 text-white font-semibold py-2 rounded-full hover:bg-blue-700"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>

          {/* Footer Links */}
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <a href="/auth/signup" className="text-blue-600">
                <u>Sign up Now</u>
              </a>
            </p>
            <a href="/auth/forgot_password" className="text-blue-500">
              <u>Forgot Password</u>
            </a>
          </div>
        </div>

        
      </div>
    </>
  );
}
