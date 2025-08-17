"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { fetchUserCards } from "../../Controller/settings/subscriptionPlanController";

const SubscriptionPaymentModel = ({ isOpen, onClose, onCardSelect }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  // Fetch user cards when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCards();
    }
  }, [isOpen]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchUserCards();
      
      if (response.success) {
        // Handle nested data structure like subscription plans
        const cardsData = response.data.data || response.data;
        
        // Simple logic: isPrimary true = MasterCard, isPrimary false = Visa
        setCards(cardsData);
      } else {
        setError(response.message || 'Failed to fetch cards');
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      setError('Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card._id);
  };

  const handleContinue = () => {
    if (onCardSelect && selectedCard) {
      const selectedCardData = cards.find(card => card._id === selectedCard);
      onCardSelect(selectedCardData);
    }
    onClose();
  };

  const formatCardNumber = (description) => {
    // Extract the last 4 digits from the description
    const match = description.match(/(\d{4})$/);
    return match ? match[1] : '****';
  };

  const getCardIcon = (paymentMethod) => {
    const method = paymentMethod?.toLowerCase();
    if (method === 'mastercard') return 'MC';
    if (method === 'visa') return 'VISA';
    if (method === 'amex') return 'AMEX';
    return 'CARD';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Choose Card</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-600 cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25A4E8]"></div>
              <span className="ml-2 text-gray-600">Loading cards...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">Error loading cards</div>
              <div className="text-gray-600 text-sm">{error}</div>
              <button
                onClick={fetchCards}
                className="mt-4 px-4 py-2 bg-[#25A4E8] text-white rounded-lg hover:bg-[#1e8bc8] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">No payment cards found</div>
              <button className="px-4 py-2 bg-[#25A4E8] text-white rounded-lg hover:bg-[#1e8bc8] transition-colors">
                Add New Card
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((card) => (
                <div
                  key={card._id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCard === card._id
                      ? card.payment_method === "MasterCard"
                        ? 'border-[#6650E4] bg-blue-50'
                        : 'border-[#25A4E8] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleCardSelect(card)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-semibold ${
                        card.payment_method === "MasterCard" 
                          ? 'bg-[#6650E4] text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getCardIcon(card.payment_method)}
                      </div>
                      <div>
                        <div className="text-gray-800 font-medium">
                          {card.payment_method} xxxx {formatCardNumber(card.payment_description)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expires {card.expiryMonth}/{card.expiryYear}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {card.isPrimary && (
                        <span className="px-2 py-1 text-xs rounded-full" style={{backgroundColor: '#EAE6FD', color: '#391FCB'}}>Primary</span>
                      )}
                      {selectedCard === card._id && (
                        <div className="w-5 h-5 text-[#25A4E8]">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Card Button */}
          <button className="w-full mt-4 py-3 cursor-pointer border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Add New Card
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleContinue}
            disabled={!selectedCard}
            className={`w-full py-3 rounded-lg font-semibold cursor-pointer transition-colors ${
              selectedCard
                ? 'bg-[#25A4E8] text-white hover:bg-[#1e8bc8]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPaymentModel; 