import { useEffect, useState } from "react";
import {
  Clock,
  AlertTriangle,
  MapPin,
  Phone,
  User,
  Droplet,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Select from "../components/Select";

interface BloodRequest {
  id: string;
  blood_type: string;
  units_needed: number;
  urgency_level: string;
  description: string;
  created_at: string;
  hospital: {
    name: string;
    contact: string;
    address: string;
  };
}

export default function DonorDashboard() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "urgent">("recent");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("blood_requests")
      .select(
        `
        *,
        hospital:profiles(name, contact, address)
      `
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
  };

  const filteredRequests = requests
    .filter(
      (request) =>
        bloodTypeFilter === "all" || request.blood_type === bloodTypeFilter
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else {
        const urgencyLevels = { low: 0, medium: 1, high: 2, critical: 3 };
        return (
          urgencyLevels[b.urgency_level as keyof typeof urgencyLevels] -
          urgencyLevels[a.urgency_level as keyof typeof urgencyLevels]
        );
      }
    });

  const getUrgencyBadgeVariant = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const bloodTypeOptions = [
    { value: "all", label: "All Blood Types" },
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "urgent", label: "Most Urgent" },
  ];

  const navItems = [
    {
      label: "Donor Profile",
      icon: <User className="h-5 w-5" />,
      to: "/profile",
    },
  ];

  return (
    <Layout title="Blood Donor Dashboard" navItems={navItems}>
      <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome, Donor
            </h1>
            <p className="text-gray-600">
              Find active blood requests and help save lives today.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
          Blood Requests
        </h2>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Select
              label=""
              options={bloodTypeOptions}
              value={bloodTypeFilter}
              onChange={(e) => setBloodTypeFilter(e.target.value)}
              className="min-w-[150px]"
            />
          </div>
          <Select
            label=""
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "urgent")}
            className="min-w-[150px]"
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <Card className="text-center py-12">
          <Droplet className="h-12 w-12 text-red-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Blood Requests
          </h3>
          <p className="text-gray-500">
            There are currently no active blood requests matching your criteria.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              hoverEffect={true}
              footer={
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              }
            >
              <div className="flex justify-between items-start mb-4">
                <Badge
                  variant={getUrgencyBadgeVariant(request.urgency_level)}
                  size="md"
                  className="capitalize"
                >
                  {request.urgency_level}
                </Badge>
                <Badge variant="error" size="lg">
                  {request.blood_type}
                </Badge>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {request.hospital.name}
                </h3>
                <div className="flex items-start text-gray-500 text-sm">
                  <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span>{request.hospital.address}</span>
                </div>
              </div>

              <div className="mb-4 flex items-center">
                <Droplet className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  {request.units_needed}{" "}
                  {request.units_needed === 1 ? "unit" : "units"} needed
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-700">
                  {request.hospital.contact}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
