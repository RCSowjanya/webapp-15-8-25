"use client";
import { FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname to get the current URL
import navItems from "../Controller/navItems";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import LogoutModal from "./LogoutModel";

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname(); // Get the current pathname
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Only show the component after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Define your nav items as before

  // Determine active item based on current pathname
  const determineActiveItem = (href) => {
    if (!mounted) return false;

    // Special case for dashboard - match both root and /dashboard paths
    if (
      href === "/dashboard" &&
      (pathname === "/" || pathname === "/dashboard")
    ) {
      return true;
    }
    // Special case for reservations - match all reservation-related paths
    if (
      href === "/availability" &&
      (pathname === "/reservations" ||
        pathname === "/create-reservation" ||
        pathname === "/create-reservation-view" ||
        pathname.startsWith("/create-reservation/"))
    ) {
      return true;
    }
    // For all other routes, match exactly
    return pathname === href;
  };

  if (!mounted) {
    return null; // Return null on server-side and first render
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-screen w-60 bg-[#F4F2FD] border-r border-[#DAD3F8] z-[99] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center py-4 px-4 lg:hidden">
          {/*<img
            src="/images/stayhub-logo.svg"
            alt="stayhub-Logo"
            className="w-32 h-auto"
          />*/}
          <button onClick={onClose} className="lg:hidden">
            <IoMdClose className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="hidden lg:flex justify-center pt-2 pb-9">
          {/* <img
            src="/images/logo.svg"
            alt="stayhub-Logo"
            className="w-44 h-full"
          />*/}
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 overflow-y-auto">
          <ul className="space-y-3">
            {navItems.map((item) => (
              <div key={item.id}>
                <li>
                  <Link href={item.href} onClick={onClose}>
                    <div
                      className={`relative w-full text-left flex items-center cursor-pointer justify-between text-[15px] p-2 rounded-md group ${
                        determineActiveItem(item.href)
                          ? "bg-[#7C69E8] text-white"
                          : "text-[#060404] hover:bg-[#7C69E8] hover:text-white"
                      }`}
                    >
                      {determineActiveItem(item.href) && (
                        <div className="absolute left-0 top-1 bottom-1 w-0.5 ml-1 bg-white rounded-r-md" />
                      )}
                      <div className="flex items-center gap-3">
                        <img
                          src={item.img}
                          alt={item.name}
                          className={`w-5 h-5 ${
                            determineActiveItem(item.href)
                              ? "brightness-0 invert" // This makes the image white
                              : "group-hover:brightness-0 group-hover:invert" // Makes image white on hover
                          }`}
                        />
                        <span className="text-[15px]">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-red-400 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
                {item.dividerAfter && <hr className="border-[#DAD3F8] my-5" />}
              </div>
            ))}
          </ul>
        </div>

        {/* Logout */}
        <div className="mt-auto p-4 bg-[#F4F2FD] mb-4">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center cursor-pointer gap-2 w-full justify-center text-[#B42318] bg-[#EEA6A633] py-2 cursor-pointer rounded-lg text-sm font-medium"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default Sidebar;
