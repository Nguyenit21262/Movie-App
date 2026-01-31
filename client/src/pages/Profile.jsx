import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";

const Profile = () => {
  const { backendUrl, getUserData } = useContext(AppContent);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    currentCity: "",
    occupation: "",
    sex: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
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

      const userData = data.userData;

      let formattedDate = "";
      if (userData.dateOfBirth) {
        const date = new Date(userData.dateOfBirth);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        formattedDate = `${day}/${month}/${year}`;
      }

      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        dateOfBirth: formattedDate,
        currentCity: userData.currentCity || "",
        occupation: userData.occupation || "",
        sex: userData.sex || "",
      });

      if (userData.image) {
        setImagePreview(`${backendUrl}/uploads/${userData.image}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load profile");
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

  const handleDobChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, "");
    if (value.length >= 3 && value.length <= 4) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    } else if (value.length > 4) {
      value =
        value.slice(0, 2) +
        "/" +
        value.slice(2, 4) +
        "/" +
        value.slice(4, 8);
    }
    setFormData((prev) => ({ ...prev, dateOfBirth: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.dateOfBirth &&
      !/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dateOfBirth)
    ) {
      return toast.error("Date must be DD/MM/YYYY");
    }

    const loadingToast = toast.loading("Updating profile...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("dateOfBirth", formData.dateOfBirth);
      formDataToSend.append("currentCity", formData.currentCity);
      formDataToSend.append("occupation", formData.occupation);
      formDataToSend.append("sex", formData.sex);

      if (image) {
        formDataToSend.append("image", image);
      }

      const { data } = await axios.put(
        `${backendUrl}/api/user/update`,
        formDataToSend,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data.success) {
        toast.update(loadingToast, {
          render: "Profile updated",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        await getUserData();
        await fetchProfile();
        setImage(null);
      } else {
        toast.update(loadingToast, {
          render: data.message || "Update failed",
          type: "error",
          isLoading: false,
        });
      }
    } catch (error) {
      toast.update(loadingToast, {
        render: error.response?.data?.message || "Update failed",
        type: "error",
        isLoading: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-start pt-20 pb-20">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-xl px-6 pt-5 pb-12"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Profile Settings
        </h2>

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img
              src={imagePreview || `${backendUrl}/uploads/userImage.png`}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
            />

            <label
              htmlFor="imageUpload"
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-1.5 rounded-full cursor-pointer"
            >
              ✎
            </label>

            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ["Full Name", "name"],
            ["Email", "email", true],
            ["Date of Birth", "dateOfBirth", false, handleDobChange],
            ["City", "currentCity"],
            ["Occupation", "occupation"],
          ].map(([label, name, disabled, customChange], i) => (
            <div key={i} className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">{label}</label>
              <input
                type="text"
                name={name}
                value={formData[name]}
                disabled={disabled}
                onChange={customChange || handleChange}
                maxLength={name === "dateOfBirth" ? 10 : undefined}
                className={`h-9 rounded-md px-3 text-sm outline-none border border-white/10
                  ${
                    disabled
                      ? "bg-zinc-800 text-gray-500 cursor-not-allowed"
                      : "bg-zinc-800 focus:border-blue-500"
                  }`}
              />
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Gender</label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="h-9 rounded-md bg-zinc-800 border border-white/10 px-3 text-sm focus:border-blue-500 outline-none"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          className="w-full mt-6 mb-6 h-9 rounded-md bg-blue-600 hover:bg-blue-700 text-sm font-medium transition"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default Profile;
