import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import { User, MapPin, Phone, Mail, ArrowLeft, Save } from "lucide-react";

interface Profile {
  id: string;
  type: "donor" | "hospital";
  name: string;
  contact: string;
  address: string;
  blood_type: string | null;
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    address: "",
    blood_type: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setFormData({
          name: data.name,
          contact: data.contact,
          address: data.address,
          blood_type: data.blood_type || "",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          contact: formData.contact,
          address: formData.address,
          blood_type: profile.type === "donor" ? formData.blood_type : null,
        })
        .eq("id", profile.id);

      if (error) {
        toast.error("Failed to update profile");
      } else {
        toast.success("Profile updated successfully");
      }
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

  const navItems = [
    {
      label: "Back to Dashboard",
      icon: <ArrowLeft className="h-5 w-5" />,
      to:
        profile?.type === "donor" ? "/donor/dashboard" : "/hospital/dashboard",
    },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitWithLoading = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleSubmit(e);
    setIsSubmitting(false);
  };

  return (
    <Layout
      title={`${profile?.type === "donor" ? "Donor" : "Hospital"} Profile`}
      navItems={navItems}
    >
      <div className="max-w-3xl mx-auto">
        <Card>
          <div className="mb-6 flex items-center">
            <div className="bg-red-50 p-3 rounded-full mr-4">
              <User className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Profile Settings
              </h2>
              <p className="text-gray-500">Update your personal information</p>
            </div>
          </div>

          <form onSubmit={handleSubmitWithLoading} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

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

            {profile?.type === "donor" && (
              <Select
                label="Blood Type"
                options={bloodTypeOptions}
                required
                value={formData.blood_type}
                onChange={(e) =>
                  setFormData({ ...formData, blood_type: e.target.value })
                }
              />
            )}

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                icon={<Save />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
