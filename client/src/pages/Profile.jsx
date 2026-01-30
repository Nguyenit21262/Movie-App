import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";

const Profile = () => {
  const { backendUrl } = useContext(AppContent);

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
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        withCredentials: true,
      });

      if (!data.success) {
        toast.error(data.message || "Unauthorized");
        return;
      }

      setFormData({
        name: data.userData.name || "",
        email: data.userData.email || "",
        dateOfBirth: data.userData.dateOfBirth
          ? data.userData.dateOfBirth.split("T")[0]
          : "",
        currentCity: data.userData.currentCity || "",
        occupation: data.userData.occupation || "",
        sex: data.userData.sex || "",
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [backendUrl]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Updating...");

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/user/profile`,
        formData,
        { withCredentials: true },
      );

      if (data.success) {
        toast.update(loadingToast, {
          render: "Updated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.update(loadingToast, {
        render: "Update failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="w-[700px] bg-black/70 border border-white/10 rounded-2xl p-8 grid grid-cols-2 gap-6"
      >
        <h2 className="col-span-2 text-3xl font-bold">Profile Settings</h2>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="h-12 rounded-full bg-black/40 border border-white/10 px-5"
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          disabled
          className="h-12 rounded-full bg-gray-800 border border-white/10 px-5 opacity-50"
        />

        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          className="h-12 rounded-full bg-black/40 border border-white/10 px-5"
        />

        <input
          type="text"
          name="currentCity"
          value={formData.currentCity}
          onChange={handleChange}
          className="h-12 rounded-full bg-black/40 border border-white/10 px-5"
        />

        <select
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
          className="h-12 rounded-full bg-black/40 border border-white/10 px-5"
        >
          <option value="">Select Occupation</option>
          <option value="student">Student</option>
          <option value="engineer">Engineer</option>
          <option value="artist">Artist</option>
          <option value="other">Other</option>
        </select>

        <select
          name="sex"
          value={formData.sex}
          onChange={handleChange}
          className="h-12 rounded-full bg-black/40 border border-white/10 px-5"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <button
          type="submit"
          className="col-span-2 mt-4 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
