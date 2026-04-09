import React, { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContent";
import { useNavigate } from "react-router-dom";
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

  // Clean, borderless input styling
  const inputClass = "w-full bg-[#1e1e1e] px-4 py-2.5 rounded-lg border-none outline-none text-white text-[15px] transition-all duration-200 focus:bg-[#252525] focus:ring-2 focus:ring-blue-500/40 appearance-none";

  const fetchProfile = async () => {
    try {
      const { data } = await getCurrentUser();
      if (!data.success) {
        toast.error(data.message || "Unauthorized access");
        return;
      }

      const user = data.userData;
      let dob = "";
      if (user.dateOfBirth) {
        const d = new Date(user.dateOfBirth);
        dob = `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1
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
      toast.error("Failed to load profile data");
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
      value = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4, 8);
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
          render: "Profile updated successfully",
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
        render: "System error occurred",
        type: "error",
        isLoading: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 flex flex-col selection:bg-blue-500/30">
      <div className="flex-1 w-full max-w-2xl mx-auto px-6 pt-20 pb-16">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Account Profile</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar & Basic Info */}
          <section className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 shrink-0 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
              {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <Input label="Full Name">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Your name"
                />
              </Input>

              <Input label="Email Address">
                <input
                  value={formData.email}
                  disabled
                  className={`${inputClass} opacity-40 cursor-not-allowed`}
                />
              </Input>
            </div>
          </section>

          {/* Details Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-8 border-t border-white/5">
            <Input label="Birth Date">
              <input
                value={formData.dateOfBirth}
                onChange={handleDobChange}
                placeholder="DD/MM/YYYY"
                className={inputClass}
              />
            </Input>

            <Input label="Gender">
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="" className="bg-[#1e1e1e]">Select</option>
                <option value="male" className="bg-[#1e1e1e]">Male</option>
                <option value="female" className="bg-[#1e1e1e]">Female</option>
                <option value="other" className="bg-[#1e1e1e]">Other</option>
              </select>
            </Input>

            <Input label="Current City">
              <input
                name="currentCity"
                value={formData.currentCity}
                onChange={handleChange}
                className={inputClass}
                placeholder="City"
              />
            </Input>

            <Input label="Occupation">
              <input
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className={inputClass}
                placeholder="Job title"
              />
            </Input>
          </section>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all active:scale-95 shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[14px] text-gray-400 font-medium ml-1">
      {label}
    </label>
    {children}
  </div>
);

export default Profile;