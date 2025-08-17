"use client";
import React, { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import Image from "next/image";
import { updateNotificationPreferences } from "@/components/Models/settings/userModel";

const Toggle = ({ enabled, setEnabled }) => {
  return (
    <div
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${
        enabled ? "bg-[#25A4E8]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </div>
  );
};

const NotificationItem = ({
  label,
  emailEnabled,
  setEmailEnabled,
  pushEnabled,
  setPushEnabled,
}) => {
  return (
    <div className="grid grid-cols-3 items-center py-4 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-700 col-span-1 text-sm md:text-base">
        {label}
      </span>
      <div className="flex justify-center">
        <Toggle enabled={emailEnabled} setEnabled={setEmailEnabled} />
      </div>
      <div className="flex justify-center">
        <Toggle enabled={pushEnabled} setEnabled={setPushEnabled} />
      </div>
    </div>
  );
};

const Notifications = ({ onBack, userData }) => {
  const [notifications, setNotifications] = useState({
    newReservation: { email: true, push: true },
    cancelReservation: { email: true, push: true },
    messages: { email: true, push: true },
    issues: { email: true, push: true },
    smartLock: { email: true, push: true },
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load notification preferences from API data
  useEffect(() => {
    if (userData?.data?.notificationPreference) {
      const apiPreferences = userData.data.notificationPreference;
      setNotifications({
        newReservation: {
          email: apiPreferences.newReservation?.emailNotification || false,
          push: apiPreferences.newReservation?.pushNotification || false,
        },
        cancelReservation: {
          email: apiPreferences.cancelReservation?.emailNotification || false,
          push: apiPreferences.cancelReservation?.pushNotification || false,
        },
        messages: {
          email: apiPreferences.messages?.emailNotification || false,
          push: apiPreferences.messages?.pushNotification || false,
        },
        issues: {
          email: apiPreferences.issues?.emailNotification || false,
          push: apiPreferences.issues?.pushNotification || false,
        },
        smartLock: {
          email: apiPreferences.smartLockUnlock?.emailNotification || false,
          push: apiPreferences.smartLockUnlock?.pushNotification || false,
        },
      });
    }
  }, [userData]);

  const handleToggle = (key, type) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: { ...prev[key], [type]: !prev[key][type] },
    }));
    setHasChanges(true);
  };

  const handleApply = async () => {
    if (!hasChanges) return;

    setLoading(true);
    try {
      // Convert to API format
      const apiFormat = {
        newReservation: {
          emailNotification: notifications.newReservation.email,
          pushNotification: notifications.newReservation.push,
        },
        cancelReservation: {
          emailNotification: notifications.cancelReservation.email,
          pushNotification: notifications.cancelReservation.push,
        },
        messages: {
          emailNotification: notifications.messages.email,
          pushNotification: notifications.messages.push,
        },
        issues: {
          emailNotification: notifications.issues.email,
          pushNotification: notifications.issues.push,
        },
        smartLockUnlock: {
          emailNotification: notifications.smartLock.email,
          pushNotification: notifications.smartLock.push,
        },
        _id: userData?.data?.notificationPreference?._id || "",
      };

      const response = await updateNotificationPreferences(apiFormat);

      if (response.success) {
        setHasChanges(false);
        alert("Notification preferences updated successfully!");
      } else {
        alert(response.message || "Failed to update notification preferences");
      }
    } catch (error) {
      alert("Error updating notification preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <header className="flex justify-between items-center pb-4 p-2 sm:p-3 md:p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border-2 cursor-pointer border-black text-black hover:bg-gray-100 transition-colors"
          >
            <IoArrowBack size={20} />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
            Settings / <span className="text-[#7C69E8]">Notification</span>
          </h1>
        </div>
        <button
          onClick={handleApply}
          disabled={!hasChanges || loading}
          className={`px-6 py-2 rounded-full font-semibold shadow-md transition-colors ${
            hasChanges && !loading
              ? "bg-[#25A4E8] text-white hover:bg-[#1d8bd6]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Updating..." : "Apply"}
        </button>
      </header>

      <main className="flex-grow w-full flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* User Profile Section 
          <div className="mb-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src={
                    userData && userData.data.image
                      ? userData.data.image
                      : "/images/nourah-alhabaan.svg"
                  }
                  alt="Profile"
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {userData
                    ? `${userData.data.fname || ""} ${
                        userData.data.lname || ""
                      }`.trim() || "User Name"
                    : "User Name"}
                </h2>
                <p className="text-sm text-gray-500">
                  {userData && userData.data && userData.data.email ? userData.data.email : "No email provided"}
                </p>
              </div>
            </div>
          </div>
          */}

          <div className="p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="grid grid-cols-3 items-center pb-4 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-800 invisible">
                NOTIFICATION TYPE
              </span>
              <div className="text-center">
                <span className="text-xs sm:text-sm font-bold text-gray-800">
                  EMAIL NOTIFICATIONS
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs sm:text-sm font-bold text-gray-800">
                  PUSH NOTIFICATIONS
                </span>
              </div>
            </div>

            <NotificationItem
              label="New Reservation"
              emailEnabled={notifications.newReservation.email}
              setEmailEnabled={() => handleToggle("newReservation", "email")}
              pushEnabled={notifications.newReservation.push}
              setPushEnabled={() => handleToggle("newReservation", "push")}
            />
            <NotificationItem
              label="Cancel Reservation"
              emailEnabled={notifications.cancelReservation.email}
              setEmailEnabled={() => handleToggle("cancelReservation", "email")}
              pushEnabled={notifications.cancelReservation.push}
              setPushEnabled={() => handleToggle("cancelReservation", "push")}
            />
            <NotificationItem
              label="Messages"
              emailEnabled={notifications.messages.email}
              setEmailEnabled={() => handleToggle("messages", "email")}
              pushEnabled={notifications.messages.push}
              setPushEnabled={() => handleToggle("messages", "push")}
            />
            <NotificationItem
              label="Issues"
              emailEnabled={notifications.issues.email}
              setEmailEnabled={() => handleToggle("issues", "email")}
              pushEnabled={notifications.issues.push}
              setPushEnabled={() => handleToggle("issues", "push")}
            />
            <NotificationItem
              label="Smart Lock/Unlock"
              emailEnabled={notifications.smartLock.email}
              setEmailEnabled={() => handleToggle("smartLock", "email")}
              pushEnabled={notifications.smartLock.push}
              setPushEnabled={() => handleToggle("smartLock", "push")}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
