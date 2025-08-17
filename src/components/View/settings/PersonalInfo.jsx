"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { IoArrowBack } from "react-icons/io5";
import { MdEdit } from "react-icons/md";

const PersonalInfo = ({ userData, onBack }) => {
  const [profileImage, setProfileImage] = useState(
    "/images/nourah-alhabaan.svg"
  );
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      // Create a URL for the selected image
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="bg-[#FAFAFA] rounded-2xl  shadow-lg h-full overflow-y-auto">
      <header className="flex justify-between items-center pb-4 p-2 sm:p-3 md:p-6 border-b border-gray-200">
        <div className="flex items-center gap-4 ">
          <button
            onClick={handleBackClick}
            className="p-1.5 rounded-lg border-2 cursor-pointer border-black text-black hover:bg-gray-100 transition-colors"
          >
            <IoArrowBack size={20} />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
            Settings / <span className="text-[#7C69E8]">Personal Info</span>
          </h1>
        </div>
        <button className="px-6 py-2 bg-[#25A4E8] text-white rounded-full font-semibold shadow-md hover:bg-[#1d8bd6] transition-colors">
          Save
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6 mx-3 pb-5">
        {/* Left Card: Profile */}
        <div className="lg:col-span-1 bg-white  rounded-xl p-8 flex flex-col items-center justify-center text-center h-fit">
          <div className="relative">
            <Image
              src={
                userData && userData.data.image
                  ? userData.data.image
                  : "/images/nourah-alhabaan.svg"
              }
              alt="Profile"
              width={128}
              height={128}
              className="rounded-3xl object-cover"
            />
            <button
              onClick={handleEditClick}
              className="absolute -top-3 -right-3 bg-white rounded-full p-2 border-2 border-black shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
              title="Change profile picture"
            >
              <MdEdit size={20} className="text-black" />
            </button>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            {userData
              ? `${userData.data.fname || ""} ${
                  userData.data.lname || ""
                }`.trim() || "User Name"
              : "User Name"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
                            {userData && userData.data && userData.data.email ? userData.data.email : "No email provided"}
          </p>
        </div>

        {/* Right Card: Form */}
        <div className="lg:col-span-2 space-y-6 bg-white p-8 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={
                userData
                  ? `${userData.data.fname || ""} ${
                      userData.data.lname || ""
                    }`.trim()
                  : ""
              }
              className="w-full p-3 bg-[#F4F2FD] rounded-lg border border-purple-100 focus:ring-2 focus:ring-[#7C69E8] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              defaultValue={userData ? userData.data.email : ""}
              className="w-full p-3 bg-[#F4F2FD] rounded-lg border border-purple-100 focus:ring-2 focus:ring-[#7C69E8] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                defaultValue={userData ? userData.data.countryCode : ""}
                className="w-1/4 p-3 bg-purple-50 rounded-lg border border-purple-100 focus:ring-2 focus:ring-[#7C69E8] outline-none"
              />
              <input
                type="text"
                defaultValue={userData ? userData.data.phone : ""}
                className="w-3/4 p-3 bg-[#F4F2FD] rounded-lg border border-purple-100 focus:ring-2 focus:ring-[#7C69E8] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IDENTITY VERIFIED
            </label>
            <div className="flex justify-between items-center w-full p-3 bg-[#F4F2FD] rounded-lg border border-purple-100">
              <span>Through NIN</span>
              <span className="text-gray-500">
                {userData?.data?.personIdInfo?.verificationNumber
                  ? userData.data.personIdInfo.verificationNumber
                  : "XXXXXXXXXX"}
              </span>
            </div>
          </div>

          {/* VAT Information */}
          <div className="space-y-4 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">VAT INFORMATION</h3>

            <div className="p-4 rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">VAT Number</p>
                <p className="font-medium text-gray-900">
                  {userData?.data?.vatDetails?.vatNumber || ""}
                </p>
              </div>
              <Image
                src="/images/info-icon.svg"
                alt="Info"
                width={24}
                height={24}
              />
            </div>

            <div className="p-4 rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  Commercial Registration ID
                </p>
                <p className="font-medium text-gray-900">
                  {userData?.data?.vatDetails?.commercialRegisterId || ""}
                </p>
              </div>
              <Image
                src="/images/info-icon.svg"
                alt="Info"
                width={24}
                height={24}
              />
            </div>

            <div className="flex items-center gap-2 text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-gray-800">
                {userData?.data?.isVatRegistered
                  ? "VAT Registered"
                  : "Not Registered"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
