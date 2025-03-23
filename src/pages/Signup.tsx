import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Droplet,
  Heart,
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  MapPin
} from "lucide-react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Card from "../components/Card";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") as "donor" | "hospital";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    contact: "",
    address: "",
    bloodType: type === "donor" ? "" : "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          user_id: data.user!.id,
          type,
          name: formData.name,
          contact: formData.contact,
          address: formData.address,
          blood_type: type === "donor" ? formData.bloodType : null,
        },
      ]);

      if (profileError) throw profileError;

      toast.success("Account created successfully!");
      if (type === "donor") {
        navigate("/donor/login");
      } else {
        navigate("/hospital/login");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignupWithLoading = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await handleSignup(e);
    } catch (err) {
      setError("Failed to create account. Please check your information.");
    } finally {
      setIsLoading(false);
    }
  };

  const bloodTypeOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Register as a {type === "donor" ? "Blood Donor" : "Hospital"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="flex justify-center">
          <div className="absolute top-[-24px] bg-white rounded-full p-3 border-2 border-red-100 shadow-md transform transition-transform hover:scale-110">
            {type === "donor" ? (
              <Heart className="h-8 w-8 text-red-600" />
            ) : (
              <Building2 className="h-8 w-8 text-red-600" />
            )}
          </div>
        </div>
        <Card className="py-8 px-4 sm:px-10">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSignupWithLoading}>
            <div className="space-y-6">
              <Input
                label="Email address"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                icon={<Mail className="h-5 w-5 text-gray-400" />}
              />

              <Input
                label="Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="space-y-6">
                <Input
                  label="Name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  icon={<User className="h-5 w-5 text-gray-400" />}
                />
                <Input
                  label="Contact"
                  type="text"
                  required
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                  icon={<Phone className="h-5 w-5 text-gray-400" />}
                />

                <Input
                  label="Address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  icon={<MapPin className="h-5 w-5 text-gray-400" />}
                />

                {type === "donor" && (
                  <Select
                    label="Blood Type"
                    options={bloodTypeOptions}
                    required
                    value={formData.bloodType}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodType: e.target.value })
                    }
                  />
                )}
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="secondary"
                fullWidth
                onClick={() =>
                  navigate(`/${type === "donor" ? "donor" : "hospital"}/login`)
                }
              >
                Sign in
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
