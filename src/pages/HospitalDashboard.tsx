import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Building2 as Hospital,
  Filter,
  Users,
  Droplet,
  User,
  Phone,
  MapPin,
  FileText,
  AlertTriangle,
  Clock,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import Select from "../components/Select";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";

interface BloodRequest {
  id: string;
  blood_type: string;
  units_needed: number;
  urgency_level: string;
  status: string;
  description: string;
  created_at: string;
}

interface Donor {
  id: string;
  name: string;
  blood_type: string;
  contact: string;
  address: string;
}

export default function HospitalDashboard() {
  const { user, signOut } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDonors, setShowDonors] = useState(false);
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all");
  const [formData, setFormData] = useState({
    blood_type: "",
    units_needed: "",
    urgency_level: "",
    description: "",
  });

  useEffect(() => {
    fetchRequests();
    fetchDonors();
  }, []);

  const fetchRequests = async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user?.id)
      .single();

    if (profile) {
      const { data, error } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("hospital_id", profile.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRequests(data);
      }
    }
  };

  const fetchDonors = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, blood_type, contact, address")
      .eq("type", "donor");

    if (!error && data) {
      setDonors(data);
    }
  };

  const handleDelete = async (requestId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this request?");
    if (!confirmed) return;

    try {
      // Get profile ID first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile error:", profileError);
        toast.error("Could not verify hospital profile");
        return;
      }

      // First verify the request exists
      const { data: request, error: requestError } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (requestError || !request) {
        console.error("Request verification error:", requestError);
        toast.error("Could not verify request exists");
        return;
      }

      console.log("Attempting to delete request:", requestId);
      console.log("Associated with hospital:", profile.id);

      // Delete the request
      const { error: deleteError } = await supabase
        .from("blood_requests")
        .delete()
        .eq("id", requestId)
        .eq("hospital_id", profile.id);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        toast.error(`Failed to delete request: ${deleteError.message}`);
      } else {
        setRequests(requests.filter(request => request.id !== requestId));
        toast.success("Request deleted successfully");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("An error occurred while deleting the request");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user?.id)
      .single();

    if (profile) {
      const { error } = await supabase.from("blood_requests").insert([
        {
          hospital_id: profile.id,
          ...formData,
        },
      ]);

      if (error) {
        toast.error("Failed to create request");
      } else {
        toast.success("Blood request created successfully");
        setShowModal(false);
        fetchRequests();
      }
    }
  };

  const filteredDonors = donors.filter(
    (donor) => bloodTypeFilter === "all" || donor.blood_type === bloodTypeFilter
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-red-600">
                Hospital Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors duration-200"
              >
                <Hospital className="h-5 w-5" />
                <span className="font-medium">Hospital Profile</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDonors(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  !showDonors
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                My Requests
              </button>
              <button
                onClick={() => setShowDonors(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  showDonors
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Available Donors
              </button>
            </div>
            {!showDonors && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Request
              </button>
            )}
          </div>

          {showDonors ? (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Users className="h-6 w-6 text-red-500 mr-2" />
                  Available Donors
                </h2>
                <div className="mt-4 sm:mt-0">
                  <Select
                    label=""
                    options={bloodTypeOptions}
                    value={bloodTypeFilter}
                    onChange={(e) => setBloodTypeFilter(e.target.value)}
                    className="min-w-[150px]"
                  />
                </div>
              </div>

              {filteredDonors.length === 0 ? (
                <Card className="text-center py-12">
                  <Users className="h-12 w-12 text-red-200 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No donors found
                  </h3>
                  <p className="text-gray-500">
                    Try changing your blood type filter
                  </p>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDonors.map((donor) => (
                    <Card key={donor.id}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Droplet className="h-4 w-4 mr-1 text-red-500" />
                          Blood Type
                        </span>
                        <Badge variant="error">{donor.blood_type}</Badge>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <User className="h-5 w-5 mr-2 text-gray-400" />
                          {donor.name}
                        </h3>
                      </div>
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-400" />
                          Contact
                        </span>
                        <p className="mt-1 text-sm text-gray-900">
                          {donor.contact}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          Address
                        </span>
                        <p className="mt-1 text-sm text-gray-900">
                          {donor.address}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <FileText className="h-6 w-6 text-red-500 mr-2" />
                  Your Blood Requests
                </h2>
              </div>

              {requests.length === 0 ? (
                <Card className="text-center py-12">
                  <FileText className="h-12 w-12 text-red-200 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No blood requests yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Create your first blood request to get started
                  </p>
                  <Button
                    variant="primary"
                    icon={<Plus />}
                    onClick={() => setShowModal(true)}
                  >
                    New Request
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {requests.map((request) => (
                    <Card key={request.id}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Droplet className="h-4 w-4 mr-1 text-red-500" />
                          Blood Type
                        </span>
                        <Badge variant="error">{request.blood_type}</Badge>
                      </div>
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Filter className="h-4 w-4 mr-1 text-gray-400" />
                          Units Needed
                        </span>
                        <p className="mt-1 text-sm text-gray-900">
                          {request.units_needed}
                        </p>
                      </div>
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1 text-gray-400" />
                          Urgency Level
                        </span>
                        <Badge
                          variant={getUrgencyBadgeVariant(
                            request.urgency_level
                          )}
                        >
                          {request.urgency_level.charAt(0).toUpperCase() +
                            request.urgency_level.slice(1)}
                        </Badge>
                      </div>
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          Status
                        </span>
                        <Badge
                          variant={
                            request.status === "active" ? "success" : "default"
                          }
                        >
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </Badge>
                      </div>
                      {request.description && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Description
                          </span>
                          <p className="mt-1 text-sm text-gray-900">
                            {request.description}
                          </p>
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <div className="text-sm flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="font-medium text-gray-500">
                              Posted{" "}
                            </span>
                            <span className="ml-1 text-gray-900">
                              {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDelete(request.id)}
                            className="text-red-600 hover:text-red-700 transition-colors duration-200"
                            title="Delete request"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    New Blood Request
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Blood Type
                      </label>
                      <select
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        value={formData.blood_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            blood_type: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Blood Type</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                          (type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Units Needed
                      </label>
                      <input
                      required
                      placeholder="How many units of blood"
                        type="number"
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        value={formData.units_needed}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            units_needed: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Urgency Level
                      </label>
                      <select
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        value={formData.urgency_level}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            urgency_level: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Urgency Level</option>
                        {["low", "medium", "high", "critical"].map((level) => (
                          <option key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                      placeholder="Additional Information"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Request
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
