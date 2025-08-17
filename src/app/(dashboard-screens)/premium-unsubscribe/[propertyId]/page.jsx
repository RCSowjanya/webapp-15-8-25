import SubscriptionPremiumDetailPage from "../../../../components/View/settings/SubscriptionPremiumDetailPage";

export default function PremiumUnsubscribePage({ params }) {
  const { propertyId } = params;
  
  // Create a subscription object with the propertyId for the component
  const subscription = {
    id: propertyId,
    propertyId: propertyId
  };

  return (
    <div className="h-full">
      <SubscriptionPremiumDetailPage subscription={subscription} />
    </div>
  );
} 