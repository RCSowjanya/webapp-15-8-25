"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import PersonalInfo from "./PersonalInfo";
import Notifications from "./Notifications";
import SubscriptionManagement from "./SubscriptionManagement";

const settingsItems = [
  {
    icon: "/images/admin.svg",
    title: "Personal info",
  },
  {
    icon: "/images/dollar-circle.svg",
    title: "Finance & Invoices",
  },
  {
    icon: "/images/payments.svg",
    title: "Payout Settings",
  },
  {
    icon: "/images/channel.svg",
    title: "Channel Management",
  },
  {
    icon: "/images/expiring-licence.svg",
    title: "Subscription Management",
  },
  {
    icon: "/images/smartlock.svg",
    title: "Smart locks",
  },
  {
    icon: "/images/alarm.svg",
    title: "Notifications",
  },
  {
    icon: "/images/lock.svg",
    title: "Change Password",
  },
];

const SettingsLayout = ({ userData, loading = false, error = null }) => {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState("grid");
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const initialView = searchParams.get("view");
    if (initialView === "subscription") {
      setView("subscription");
    }
  }, [searchParams]);

  console.log("userData:", userData);

  const handleItemClick = (title) => {
    if (title === "Personal info") {
      setView("form");
    } else if (title === "Notifications") {
      setView("notifications");
    } else if (title === "Subscription Management") {
      setView("subscription");
    }
  };

  const handleBackToGrid = () => {
    setView("grid");
  };

  if (view === "form") {
    return <PersonalInfo onBack={handleBackToGrid} userData={userData} />;
  }

  if (view === "notifications") {
    return <Notifications onBack={handleBackToGrid} userData={userData} />;
  }

  if (view === "subscription") {
    return <SubscriptionManagement onBack={handleBackToGrid} />;
  }

  // Don't render until component is mounted
  if (!mounted) {
    return (
      <div className="bg-white h-full flex flex-col">
        <div className="flex-grow p-4 overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full flex flex-col">
      <div className="flex-grow p-4 overflow-y-auto">
        <header className="py-2">
          <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
        </header>

        <div className="flex flex-col items-center my-3">
          <div className="relative">
            <Image
              src={
                userData?.data?.image
                  ? userData.data.image
                  : "/images/nourah-alhabaan.svg"
              }
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full"
              priority
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {userData?.data?.fname || userData?.data?.lname
              ? `${userData?.data?.fname || ""} ${
                  userData?.data?.lname || ""
                }`.trim() || "User Name"
              : "User Name"}
          </h2>
          <p className="mt-1 text-md text-gray-500">
            {userData && userData.data && userData.data.email
              ? userData.data.email
              : "No email provided"}
          </p>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-6  max-w-4xl mx-auto">
          {settingsItems.map((item, index) => {
            return (
              <div
                key={index}
                onClick={() => handleItemClick(item.title)}
                className="group p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all duration-300 bg-white border-2 border-gray-200 hover:border-[#7C69E8]"
              >
                <div className="p-3 rounded-full  transition-colors duration-300 bg-gray-100 group-hover:bg-[#7C69E8]">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={20}
                    height={20}
                    className="transition-all duration-300 filter brightness-0 group-hover:invert"
                  />
                </div>
                <span
                  className={"text-md font-semibold text-center text-gray-700 "}
                >
                  {item.title}
                </span>
              </div>
            );
          })}
        </main>
      </div>

      <footer className="w-full border-t border-gray-200 bg-white flex-shrink-0">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <a href="#" className="hover:text-gray-700">
              Delete Account
            </a>
            <a href="#" className="hover:text-gray-700">
              Terms of service
            </a>
            <a href="#" className="hover:text-gray-700">
              Privacy policy
            </a>
          </div>
          <div>
            <span>@2025 StayHub, All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SettingsLayout;