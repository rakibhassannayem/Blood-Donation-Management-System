import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

import { useNavigate } from "react-router-dom";
import {
  Droplet,
  Building2 as Hospital,
  Heart,
  Users,
  Activity
} from "lucide-react";
import Button from "../components/Button";

export default function LandingPage() {
  const [donorCount, setDonorCount] = useState("0");
  const [hospitalCount, setHospitalCount] = useState("0");
  const [requestCount, setRequestCount] = useState("0");

  useEffect(() => {
    async function fetchCounts() {
      // Fetch donor count
      const { count: donorCount, error: donorError } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("type", "donor");

      if (!donorError && donorCount !== null) {
        setDonorCount(donorCount.toString() + "+");
      }

      // Fetch hospital count
      const { count: hospitalCount, error: hospitalError } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("type", "hospital");

      if (!hospitalError && hospitalCount !== null) {
        setHospitalCount(hospitalCount.toString() + "+");
      }

      // Fetch blood request count
      const { count: requestCount, error: requestError } = await supabase
        .from("blood_requests")
        .select("*", { count: "exact" })
        .eq("status", "active");

      if (!requestError && requestCount !== null) {
        setRequestCount(requestCount.toString() + "+");
      }
    }

    fetchCounts();
  }, []);

  const navigate = useNavigate();

  const stats = [
    {
      icon: <Users className="h-6 w-6 text-red-500" />,
      value: donorCount,
      label: "Registered Donors",
    },
    {
      icon: <Activity className="h-6 w-6 text-red-500" />,
      value: hospitalCount,
      label: "Partner Hospitals",
    },
    {
      icon: <Hospital className="h-6 w-6 text-red-500" />,
      value: requestCount,
      label: "Donation Request",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-red-50">
      {/* Navigation */}
      <nav className="bg-white bg-opacity-0 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Droplet className="h-8 w-8 text-red-600 mr-2" />
              <span className="font-bold text-xl text-red-600">
                BloodConnect
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-2 pb-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="relative">
              <Droplet className="h-20 w-20 text-red-600 mx-auto mb-8 animate-pulse" />
              <div className="absolute -inset-1 bg-red-100 rounded-full blur-xl opacity-30 animate-pulse"></div>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800 mb-6">
              Connecting Lives Through Blood Donation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Join our community of donors and hospitals to help save lives.
              Every donation counts in our mission to ensure blood is available
              for those who need it most.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Button
                variant="primary"
                size="lg"
                icon={<Heart />}
                onClick={() => navigate("/donor/login")}
              >
                Become a Donor
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={<Hospital />}
                onClick={() => navigate("/hospital/login")}
              >
                Register Hospital
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white/20 rounded-xl mx-auto shadow-lg w-[70%] p-8 mb-16">
            <div className="flex justify-between">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="bg-red-50 p-3 rounded-full">
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-8">
            <div className="text-center text-sm text-gray-500">
              <p>
                © {new Date().getFullYear()} Blood Donation Platform. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
