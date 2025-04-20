"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineMail, AiOutlineLock, AiOutlineArrowLeft, AiOutlineUser } from "react-icons/ai";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [step, setStep] = useState(0); // 0: selection, 1: names, 2: credentials
  const [role, setRole] = useState<"individual" | "organization" | null>(null);

  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check session
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push("/dashboard");
    };
    checkUserSession();
  }, [router]);

  const handleGoogleSignup = async () => {
    setLoading(true);
    const metadata =
      role === "individual"
        ? { fullName, role }
        : { organizationName, adminName, role };

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent"
        },
      },
    });

    if (error) toast.error(error.message);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and Password are required.");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Invalid email.");
      return;
    }

    setLoading(true);

    const userMetadata =
      role === "individual"
        ? { fullName, role }
        : { organizationName, adminName, role };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signup successful! Redirecting...");
      router.push("/dashboard");
    }
  };

  const renderInitialChoice = () => (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-xl shadow-md w-full max-w-md text-center">
      <h1 className="text-3xl font-bold text-black">Welcome to <span className="text-blue-600">CallLive.ai</span></h1>
      <p className="text-gray-600 text-sm">Join us by creating an Individual or Organization account.</p>

      <button
        onClick={() => {
          setRole("individual");
          setStep(1);
        }}
        className="w-full border p-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50"
      >
        <AiOutlineUser className="text-xl" /> Signup as Individual
      </button>

      <button
        onClick={() => {
          setRole("organization");
          setStep(1);
        }}
        className="w-full border p-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50"
      >
        <HiOutlineBuildingOffice2 className="text-xl" /> Signup as Organization
      </button>

      <div className="text-center mt-2 text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-600 underline">
          Sign In
        </Link>
      </div>
    </div>
  );

  const renderStepOne = () => (
    <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
      <button className="mb-4 text-gray-600" onClick={() => setStep(0)}>
        <AiOutlineArrowLeft className="text-2xl" />
      </button>
      <h2 className="text-xl font-semibold mb-4 text-black">
        {role === "individual" ? "What's your full name?" : "Organization Details"}
      </h2>
      {role === "individual" ? (
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-blue-500"
        />
      ) : (
        <>
          <input
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="Organization Name"
            className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-blue-500"
          />
          <input
            type="text"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="Admin Name"
            className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-blue-500"
          />
        </>
      )}
      <button
        onClick={() => setStep(2)}
        className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700"
      >
        Next
      </button>
    </div>
  );

  const renderStepTwo = () => (
    <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
      <button className="mb-4 text-gray-600" onClick={() => setStep(1)}>
        <AiOutlineArrowLeft className="text-2xl" />
      </button>
      <h2 className="text-xl font-semibold mb-4 text-black">Create your account</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <AiOutlineMail className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border pl-10 pr-4 py-2 rounded-lg focus:outline-blue-500"
          />
        </div>
        <div className="relative">
          <AiOutlineLock className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full border pl-10 pr-10 py-2 rounded-lg focus:outline-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      {role === "individual" ? (
        <>
          <div className="my-2 text-center text-gray-500">OR</div>
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="flex items-center justify-center w-full bg-white border border-gray-300 text-black font-semibold py-2 rounded shadow-md hover:bg-gray-100 mb-3"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            {loading ? "Signing up..." : "Sign Up with Google"}
          </button>
        </>
      ) : (
        <> </>
      )}

      <div className="text-center mt-2 text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-600 underline">
          Sign In
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen">

      {/* Left Side - Content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 bg-gray-100">
        {step === 0 ? renderInitialChoice() : step === 1 ? renderStepOne() : renderStepTwo()}
        <Toaster position="bottom-left" />
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-blue-600 text-white p-6 relative">
        <Image src="/side_image.png" alt="Illustration" width={500} height={500} />
      </div>
    </div>
  );
}
