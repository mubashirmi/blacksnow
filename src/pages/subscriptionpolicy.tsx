'use client';

export default function SubscriptionPolicyPage() {
    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            {/* Header */}
            <div className='relative z-10 pt-20 pb-10 px-6'>
                <div className='container mx-auto max-w-4xl text-center'>
                    <h1 className='text-2xl lg:text-6xl font-black text-white mb-4 sm:mb-5 animate-slide-in-up delay-200'>
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Subscription Policy</span>
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className='relative z-10 px-6 pb-24'>
                <div className='container mx-auto max-w-4xl'>
                    <div className='bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/20 rounded-3xl p-12 shadow-xl shadow-[#2c7bbe]/10 animate-slide-in-up relative'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-t-3xl' />

                        <div className='prose prose-invert prose-lg max-w-none space-y-5'>
                            <p className='text-gray-300 leading-relaxed text-base'>
                                <span className='font-bold text-white'>Black Snow Holdings Subscription Policy</span>
                                <br />
                                <span className='text-gray-500 text-sm'>Last updated: February 2026</span>
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                This Subscription Policy outlines the terms governing your subscription to Black Snow Holdings services, including access to our
                                online trading education materials, weekly market intelligence newsletter, stock picks, strategy insights, paper trading
                                simulator features, and related content (&quot;Services&quot;).
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                <span className='font-bold text-white'>1. Subscription Plans</span>
                                <br />
                                We offer monthly/annual/other subscription plans for access to premium content. Details, including pricing and features, are
                                displayed on our Pricing page or during checkout. Prices are in USD/PKR/other and exclude applicable taxes.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                <span className='font-bold text-white'>2. Billing and Payment</span>
                                <br />
                                Subscriptions are billed monthly/annually in advance via the payment method you provide. By subscribing, you authorize Black
                                Snow Holdings (or our payment processor) to charge your selected payment method automatically on the billing date. You are
                                responsible for keeping your payment information current. Failed payments may result in suspension of access until resolved. We
                                may change pricing with notice (via email or site update) at least 30 days in advance; continued use after changes constitutes
                                acceptance.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                <span className='font-bold text-white'>3. Auto-Renewal</span>
                                <br />
                                Subscriptions automatically renew at the end of each term unless canceled before the renewal date. You can cancel anytime via
                                your account dashboard or by contacting support@blacksnowholdings.com.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                <span className='font-bold text-white'>4. Cancellation and Refunds</span>
                                <br />
                                You may cancel your subscription at any time. Access continues until the end of the current paid period (no prorated refunds
                                unless required by law). Refunds are generally not provided for partial periods, but we may offer them at our discretion (e.g.,
                                within 7–14 days of initial purchase for new subscribers). To cancel or request a refund, email support with your account
                                details.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                <span className='font-bold text-white'>5. Access and Termination</span>
                                <br />
                                Upon subscription, you receive non-exclusive, non-transferable access for personal use only. We may suspend or terminate access
                                for violations (e.g., sharing credentials, misuse of content). We reserve the right to modify, discontinue, or limit Services
                                with notice where possible.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>
                                <span className='font-bold text-white'>6. Your Responsibilities</span>
                                <br />
                                You agree not to reproduce, distribute, or commercially exploit our content without permission. All materials remain our
                                intellectual property. By subscribing, you accept this Policy along with our Terms & Conditions and Privacy Policy.
                            </p>

                            <p className='text-gray-300 leading-relaxed text-base'>Contact: support@blacksnowholdings.com for questions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
