import { useSession } from "next-auth/react"
import React, { useState, useEffect } from "react";
import { FaSearch, FaBell } from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import { IoMdClose } from "react-icons/io";

const Header = ({ onMenuClick }) => {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render user type until client-side hydration is complete
  const getUserType = () => {
    if (!mounted || status === "loading") {
      return "Loading...";
    }
    return session?.user?.isInvitedUser ? "Invited User" : "Host";
  };

  return (
    <div className="flex justify-between px-4 sm:px-6 py-2 items-center shadow border-b border-gray-300">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <MdMenu className="w-6 h-6 text-gray-600" />
        </button>
        <img
          src={session?.user?.image}
          alt="Avatar"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
        />
        
        <div>
          <p className="text-sm font-bold">{session?.user?.name}</p>
          <p className="text-xs text-gray-500 font-medium">
            {getUserType()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-8">
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search here"
            className="pl-4 pr-10 py-2 border border-gray-200 bg-white rounded-xl text-sm w-48 sm:w-72 shadow-sm"
          />
          <FaSearch className="w-4 h-4 absolute right-3 top-2.5 text-gray-500" />
        </div>
        <button className="relative p-2 bg-[#F0EDFC] hover:bg-gray-100 rounded-full">
          <FaBell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  );
};

export default Header;