import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Droplet, Heart, Building2, Mail, Lock } from "lucide-react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

export default function DonorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"donor" | "hospital">("donor");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from("profiles")
        .select("type")
        .eq("user_id", data.user.id)
        .single();

      if (profile?.type === "donor") {
        navigate("/donor/dashboard");
      } else {
        navigate("/hospital/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginWithLoading = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await handleLogin(e);
    } catch (err) {
      setError("Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center mb-2">
          <Droplet className="h-12 w-12 text-red-600" />
          <span className="ml-2 text-2xl font-bold text-red-600">
            BloodConnect
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {userType === "donor"
            ? "Donate blood, save lives"
            : "Manage blood requests efficiently"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="flex justify-center">
          <div className="absolute top-[-24px] bg-white rounded-full p-3 border-2 border-red-100 shadow-md transform transition-transform hover:scale-110">
            {userType === "donor" ? (
              <Heart className="h-8 w-8 text-red-600" />
            ) : (
              <Building2 className="h-8 w-8 text-red-600" />
            )}
          </div>
        </div>
        <Card className="py-8 px-4 sm:px-10">
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setUserType("donor")}
                className="px-4 py-2 text-sm font-medium rounded-l-lg  bg-red-600 text-white"
              >
                Donor
              </button>
              <button
                type="button"
                onClick={() => navigate("/hospital/login")}
                className="px-4 py-2 text-sm font-medium rounded-r-lg bg-white text-gray-700 hover:bg-gray-50"
              >
                Hospital
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLoginWithLoading}>
            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/signup?type=donor`)}
              >
                Register as Donor
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
