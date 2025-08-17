import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { getAllNeighbourhoods } from "../../Controller/livefeed/AllNeighbourhoods";

const NeighbourhoodSelectModal = ({ isOpen, onClose, onSubmit }) => {
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      
      const fetchNeighbourhoods = async () => {
        try {
          const result = await getAllNeighbourhoods();
          if (result.success) {
            setNeighbourhoods(result.neighbourhoods);
          } else {
            setNeighbourhoods([]);
            setError(result.error);
          }
        } catch (error) {
          setNeighbourhoods([]);
          setError("Failed to load neighbourhoods");
        } finally {
          setLoading(false);
        }
      };
      
      fetchNeighbourhoods();
    }
  }, [isOpen]);

  const handleNeighbourhoodSelect = (neighbourhood) => {
    setSelectedNeighbourhood(neighbourhood);
  };

  const handleReset = () => {
    setSelectedNeighbourhood("all");
  };

  const handleSubmit = () => {
    if (selectedNeighbourhood === "all") {
      onSubmit("all");
    } else {
      onSubmit(selectedNeighbourhood);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 overflow-y-auto max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#5940C8]">Select Neighbourhoods</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="text-orange-500 hover:text-orange-600 cursor-pointer transition-colors font-medium"
            >
              RESET
            </button>
            
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && <div className="text-center py-4">Loading...</div>}
          {error && (
            <div className="text-center text-red-500 py-4">{error}</div>
          )}
          {!loading && !error && (
            <div className="space-y-3">
              {neighbourhoods.length === 0 && (
                <div className="text-center text-gray-500">
                  No neighbourhoods found.
                </div>
              )}
              
              {/* All Neighbourhoods Option */}
              <div
                className="flex items-center justify-between py-3 px-4 rounded-lg transition-colors cursor-pointer border border-gray-200"
                style={{
                  background: selectedNeighbourhood === "all" ? "#F4F8FF" : "transparent",
                }}
                onClick={() => handleNeighbourhoodSelect("all")}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800">All Neighbourhoods</span>
                </div>
                <div
                  className={`w-5 h-5 flex items-center justify-center border-2 rounded-full ${
                    selectedNeighbourhood === "all" ? 'bg-[#25A4E8] border-[#25A4E8]' : 'border-gray-100 bg-white'
                  }`}
                  style={{ minWidth: 20 }}
                >
                  {selectedNeighbourhood === "all" && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8.5L7 11.5L12 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>

              {/* Neighbourhood List */}
              {neighbourhoods.map(neighbourhood => (
                <div
                  key={neighbourhood}
                  className="flex items-center justify-between py-3 px-4 rounded-lg transition-colors cursor-pointer border border-gray-200"
                  style={{
                    background: selectedNeighbourhood === neighbourhood ? "#F4F8FF" : "transparent",
                  }}
                  onClick={() => handleNeighbourhoodSelect(neighbourhood)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">{neighbourhood}</span>
                  </div>
                  <div
                    className={`w-5 h-5 flex items-center justify-center border-2 rounded-full ${
                      selectedNeighbourhood === neighbourhood ? 'bg-[#25A4E8] border-[#25A4E8]' : 'border-gray-100 bg-white'
                    }`}
                    style={{ minWidth: 20 }}
                  >
                    {selectedNeighbourhood === neighbourhood && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 8.5L7 11.5L12 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center pt-6">
            <button
              onClick={handleSubmit}
              disabled={!selectedNeighbourhood}
              className="w-full px-8 py-3 bg-[#25A4E8] cursor-pointer text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeighbourhoodSelectModal;