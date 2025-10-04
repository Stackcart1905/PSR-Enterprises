import { useState } from "react";
import api from "../lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Settings as SettingsIcon,
  Lock,
  Eye,
  EyeOff,
  Shield,
  User,
  Bell,
  Palette,
  Globe,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function AdminSettings() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // const [profileData, setProfileData] = useState({
  //   name: 'Admin',
  //   email: 'admin@psrenterprises.com',
  //   phone: '+91 9876543210',
  //   role: 'Administrator'
  // })

  // const [notificationSettings, setNotificationSettings] = useState({
  //   emailNotifications: true,
  //   orderAlerts: true,
  //   lowStockAlerts: true,
  //   customerMessages: false
  // })

  // const [appearanceSettings, setAppearanceSettings] = useState({
  //   theme: 'light',
  //   language: 'en',
  //   dateFormat: 'DD/MM/YYYY',
  //   timezone: 'Asia/Kolkata'
  // })

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters long";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)
    ) {
      errors.newPassword =
        "Password must contain uppercase, lowercase, and numbers";
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword =
        "New password must be different from current password";
    }

    return errors;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = validatePassword();

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsLoading(true);
    setPasswordErrors({});

    try {
      const res = await api.post("/api/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      //?  Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage(res.data?.message || "Password updated successfully!");

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      setPasswordErrors({
        general:
          error.response?.data?.message ||
          "Failed to update password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleProfileChange = (e) => {
  //   const { name, value } = e.target
  //   setProfileData(prev => ({
  //     ...prev,
  //     [name]: value
  //   }))
  // }

  // const handleNotificationChange = (setting) => {
  //   setNotificationSettings(prev => ({
  //     ...prev,
  //     [setting]: !prev[setting]
  //   }))
  // }

  // const handleAppearanceChange = (e) => {
  //   const { name, value } = e.target
  //   setAppearanceSettings(prev => ({
  //     ...prev,
  //     [name]: value
  //   }))
  // }

  return (
    <div className="space-y-6">
      {/* //! Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">
            Manage your admin account and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* //! Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* //! Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Ensure your account stays secure with a strong password
              </CardDescription>
            </CardHeader>
            <CardContent>
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 text-sm">
                    {successMessage}
                  </span>
                </div>
              )}

              {passwordErrors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-red-700 text-sm">
                    {passwordErrors.general}
                  </span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* //! Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                        passwordErrors.currentPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-red-600 text-sm mt-1">
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                {/* //! New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                        passwordErrors.newPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-red-600 text-sm mt-1">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters with uppercase, lowercase, and
                    numbers
                  </p>
                </div>

                {/* //! Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                        passwordErrors.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
