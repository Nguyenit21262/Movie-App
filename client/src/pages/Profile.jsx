import React, { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContent";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Users,
} from "lucide-react";
import { getCurrentUser, updateUserProfile } from "../api/userApi";

const Profile = () => {
  const { getUserData } = useContext(AppContent);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    currentCity: "",
    occupation: "",
    sex: "",
  });

  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await getCurrentUser();

      if (!data.success) {
        toast.error(data.message || "Unauthorized");
        return;
      }

      const user = data.userData;

      let dob = "";
      if (user.dateOfBirth) {
        const d = new Date(user.dateOfBirth);
        dob = `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1,
        ).padStart(2, "0")}/${d.getFullYear()}`;
      }

      setFormData({
        name: user.name || "",
        email: user.email || "",
        dateOfBirth: dob,
        currentCity: user.currentCity || "",
        occupation: user.occupation || "",
        sex: user.sex || "",
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDobChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, "");

    if (value.length >= 3 && value.length <= 4) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    } else if (value.length > 4) {
      value =
        value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4, 8);
    }

    setFormData((prev) => ({ ...prev, dateOfBirth: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Updating profile...");

    try {
      const { data } = await updateUserProfile(formData);

      if (data.success) {
        toast.update(loadingToast, {
          render: "Profile updated",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });

        await getUserData();
      } else {
        toast.update(loadingToast, {
          render: "Update failed",
          type: "error",
          isLoading: false,
        });
      }
    } catch {
      toast.update(loadingToast, {
        render: "Update failed",
        type: "error",
        isLoading: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100">
      {/* Navbar */}
      <nav className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </nav>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-neutral-800 rounded-xl shadow-xl p-6 border border-neutral-700">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
              {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
            </div>

            <p className="mt-2 text-gray-400 text-sm">{formData.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <Input label="Full Name" icon={<User size={16} />}>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
              />
            </Input>

            {/* Email */}
            <Input label="Email" icon={<Mail size={16} />}>
              <input
                value={formData.email}
                disabled
                className="input bg-neutral-900 opacity-70"
              />
            </Input>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Date of Birth" icon={<Calendar size={16} />}>
                <input
                  value={formData.dateOfBirth}
                  onChange={handleDobChange}
                  placeholder="DD/MM/YYYY"
                  className="input"
                />
              </Input>

              <Input label="Gender" icon={<Users size={16} />}>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Input>

              <Input label="City" icon={<MapPin size={16} />}>
                <input
                  name="currentCity"
                  value={formData.currentCity}
                  onChange={handleChange}
                  className="input"
                />
              </Input>

              <Input label="Occupation" icon={<Briefcase size={16} />}>
                <input
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="input"
                />
              </Input>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 h-10 rounded-lg border border-neutral-600 text-gray-300 hover:bg-neutral-700 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .input {
          width: 100%;
          height: 38px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid #404040;
          outline: none;
          color: #f3f4f6;
          font-weight: 400;
          background: #262626;
        }

        .input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .input::placeholder {
          color: #9ca3af;
        }

        select.input {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

const Input = ({ label, icon, children }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-2 text-sm text-gray-300 font-medium">
      <span className="text-blue-500">{icon}</span>
      {label}
    </label>
    {children}
  </div>
);

export default Profile;
