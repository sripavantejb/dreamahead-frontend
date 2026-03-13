import { Footer } from "@/components/Footer";

const Refund = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6">Refund & Cancellation Policy</h1>
          <div className="prose prose-slate max-w-none">
            <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Refund Policy</h2>
            <p className="text-muted-foreground mb-4">
              We offer refunds on paid services within 7 days of purchase if you are not satisfied with the service. Please contact us with your order details.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Cancellation Policy</h2>
            <p className="text-muted-foreground mb-4">
              You may cancel your subscription at any time. Upon cancellation, you will continue to have access to paid features until the end of your billing period.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Processing Time</h2>
            <p className="text-muted-foreground mb-4">
              Refunds are processed within 7-10 business days after approval. The refund will be credited to your original payment method.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Non-Refundable Items</h2>
            <p className="text-muted-foreground mb-4">
              Certain items are non-refundable, including digital downloads that have been accessed and one-time consultation services.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact for Refunds</h2>
            <p className="text-muted-foreground mb-4">
              For refund requests, please email us at support@collegecompanionhub.in with your order number and reason for refund.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Refund;
