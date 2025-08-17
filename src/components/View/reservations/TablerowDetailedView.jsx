import React from "react";
import { MdCall } from "react-icons/md";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaEnvelope } from "react-icons/fa";
import { BiSolidMessageDetail } from "react-icons/bi";
import { TbArrowsExchange2 } from "react-icons/tb";

const StatusBadge = ({
  status,
  statusType,
  statusIcon,
  time,
  alarmIcon,
  walletIcon,
}) => {
  const bgClass =
    statusType === "green"
      ? "bg-green-100 text-green-700"
      : statusType === "red"
      ? "bg-[#FFB8B8] text-[#821F1F]"
      : statusType === "gray"
      ? "bg-gray-100 text-gray-700"
      : statusType === "blue"
      ? "bg-[#CAE7F7] text-[#156B9B]"
      : "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-left   text-[10px] gap-2 pl-4 py-2 rounded-full text-xs font-medium ${bgClass}`}
    >
      {statusIcon && <img src={statusIcon} className="w-4 h-4" />}
      {status}
      {time && (
        <span className="text-gray-500 text-[10px] font-semibold flex items-center gap-1">
          {alarmIcon && <img src={alarmIcon} className="w-3 h-3" />}
          {time}
        </span>
      )}
      {walletIcon && <img src={walletIcon} className="w-4 h-4" />}
    </span>
  );
};

const TablerowDetailedView = ({ reservation, onClose }) => {
  if (!reservation) return null;

  console.log("TablerowDetailedView reservation:", reservation);

  // Example notes array; replace with reservation.notes if available
  // const notes = [
  //   {
  //     author: "Michael (Host)",
  //     time: "Just now",
  //     message: "Paid balance amount 200 SAR",
  //   },
  //   {
  //     author: "Sarah (Co-Host)",
  //     time: "2d ago",
  //     message:
  //       "pending 200 SAR. Reservation created. Guest requested late checkout.",
  //   },
  // ];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[900px] p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-4 right-6 text-2xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Left: Reservation Details */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[#2F2664] mb-2">
              {reservation.title}
            </h2>
            <div className="mb-2">
              <div className="text-sm text-gray-600">Guest Name</div>
              <div className="font-semibold">{reservation.guestName}</div>
            </div>
            <div className="flex gap-4 mb-2">
              <div>
                <div className="text-sm text-gray-600">Reservation No.</div>
                <div className="font-semibold">{reservation.bookingId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Unit No.</div>
                <div className="font-semibold">{reservation.unitNo}</div>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-sm text-gray-600">Reservation Type</div>
              <div className="font-semibold">
                {reservation.isStayhubBooking
                  ? "Stayhub"
                  : reservation.channel
                  ? `External - ${reservation.channel}`
                  : "N/A"}
              </div>
            </div>
            <div className="mb-2">
              <div className="text-sm text-gray-600">Reservation Created</div>
              <div className="font-semibold">
                {(() => {
                  const createdAt = reservation.createdAt;
                  if (!createdAt) return "N/A";
                  
                  try {
                    const date = new Date(createdAt);
                    if (isNaN(date.getTime())) return "N/A";
                    
                    return date.toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });
                  } catch (error) {
                    console.error('Error formatting date:', error);
                    return "N/A";
                  }
                })()}
              </div>
            </div>
            <div className="mb-2 flex gap-2 items-center">
              <div>
                <div className="text-sm text-gray-600">Check-in</div>
                <div className="font-semibold">{reservation.checkIn}</div>
              </div>
              <span className="mx-2">⇄</span>
              <div>
                <div className="text-sm text-gray-600">Check-out</div>
                <div className="font-semibold">{reservation.checkOut}</div>
              </div>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded bg-blue-100 text-blue-800 text-sm font-medium">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Reservation Confirmed
              </span>
            </div>
          </div>
          {/* Right: Notes and Contact */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-md mb-2">Attached Note</div>
            <div className="bg-[#F6F6FB] rounded-lg p-3 mb-3">
              {reservation.notes && reservation.notes.length > 0 ? (
                reservation.notes.map((note, idx) => (
                  <div key={idx} className="mb-2 pb-2 border-b border-gray-200">
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {note.text}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No notes available.</div>
              )}
            </div>
            <div className="font-bold text-md mb-2">Contact Guest</div>
            <div className="flex flex-col gap-2">
              <button className="flex items-center gap-2 text-[#6B5DD3] font-medium">
                <MdCall className="w-5 h-5" />
                Call via Phone
              </button>
              <button className="flex items-center gap-2 text-[#6B5DD3] font-medium">
                <IoLogoWhatsapp className="w-5 h-5 text-green-700" />
                Message via Whatsapp
              </button>
              <button className="flex items-center gap-2 text-[#6B5DD3] font-medium">
                <BiSolidMessageDetail className="w-5 h-5" />
                Message
              </button>
              <button className="flex items-center gap-2 text-[#6B5DD3] font-medium">
                <FaEnvelope className="w-5 h-5" />
                Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablerowDetailedView;
