// components/HeroSection.tsx
import AuthModal from '@/components/AuthModal';
import { PricingComponent } from '@/components/PricingComponent';
import { LottieAnimation } from '@/components/lottie-animation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription as DialogDesc, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { Calendar, CheckCircle, X } from 'lucide-react';
import { parseCookies } from 'nookies';
import { useEffect, useState } from 'react';

export default function HeroSection() {
    const [pricingOpen, setPricingOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [openPricingAfterAuth, setOpenPricingAfterAuth] = useState(false);
    const { loading: authLoading } = useAuth();
    const [isSubscribeFormOpen, setIsSubscribeFormOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isCheckingOpen, setIsCheckingOpen] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [agree, setAgree] = useState(false);
    const [formErrors, setFormErrors] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        agree?: string;
    }>({});
    const [entitlementError, setEntitlementError] = useState<string | null>(null);

    // ---------- Handlers ----------
    const openSubscribeFlow = async () => {
        if (authLoading || checkingAccess) return;
        const userId = localStorage.getItem('userId') || localStorage.getItem('id');
        const cookies = parseCookies();
        const id = cookies.id || userId;

        if (!userId || !id) {
            setIsSubscribeFormOpen(false);
            setPricingOpen(false);
            setOpenPricingAfterAuth(false);
            setAuthOpen(true);
            return;
        }
        try {
            setEntitlementError(null);
            setCheckingAccess(true);
            setIsCheckingOpen(true);
            const response = await fetch(`/api/v2/get-user-product-info/?id=${id}`);
            const data = await response.json();
            const newsLetterStatus = data?.data?.NewsLetter;
            if (newsLetterStatus !== 'Purchased') {
                setIsSubscribeFormOpen(false);
                setPricingOpen(true);
            } else {
                setPricingOpen(false);
                setIsSubscribeFormOpen(true);
            }
        } catch (err: any) {
            console.error('Entitlement check failed:', err);
            setEntitlementError('We could not verify your newsletter entitlement. Please try again.');
        } finally {
            setCheckingAccess(false);
            setIsCheckingOpen(false);
        }
    };

    const handleAuthSuccess = () => {
        setIsSubscribeFormOpen(false);
        setPricingOpen(false);
        setOpenPricingAfterAuth(true);
        setAuthOpen(false);
        return false;
    };

    useEffect(() => {
        if (authOpen || !openPricingAfterAuth) return;

        const timer = window.setTimeout(() => {
            setOpenPricingAfterAuth(false);
            setPricingOpen(true);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [authOpen, openPricingAfterAuth]);

    const validateForm = () => {
        const errors: typeof formErrors = {};
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!firstName.trim()) errors.firstName = 'First name is required.';
        if (!lastName.trim()) errors.lastName = 'Last name is required.';
        if (!email.trim()) errors.email = 'Email is required.';
        else if (!emailRegex.test(email)) errors.email = 'Please enter a valid email address.';
        if (!agree) errors.agree = 'You must agree to the terms and policies.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitNewsletter = async () => {
        if (!validateForm()) return;
        try {
            setSubmitLoading(true);
            const res = await fetch('/api/v1/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                }),
            });
            if (!res.ok) throw new Error('Request failed');
            setIsSubscribeFormOpen(false);
            setIsSuccessModalOpen(true);
            setFirstName('');
            setLastName('');
            setEmail('');
            setAgree(false);
            setFormErrors({});
        } catch (err) {
            console.error('Newsletter submission failed:', err);
            setFormErrors((prev) => ({ ...prev, email: 'Submission failed. Please try again.' }));
        } finally {
            setSubmitLoading(false);
        }
    };

    const FieldError = ({ msg }: { msg?: string }) => (msg ? <p className='text-xs text-red-400 mt-1'>{msg}</p> : null);

    const NewsletterSubscribeBar = ({ className = '' }: { className?: string }) => (
        <div
            className={[
                'relative w-full rounded-2xl border border-[#4cc7e8]/45 bg-[#0b0d12]/55 backdrop-blur-2xl',
                'shadow-[0_0_0_1px_rgba(76,199,232,0.22),0_0_45px_rgba(76,199,232,0.14)]',
                'p-5 sm:p-6',
                className,
            ].join(' ')}
        >
            <div className='absolute inset-0 rounded-2xl pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(76,199,232,0.12),transparent_55%)]' />
            <div className='relative'>
                <div className='space-y-2'>
                    <h3 className='max-[420px]:text-base text-lg sm:text-xl font-bold text-white leading-[1.28]'>Weekly Market Intelligence</h3>
                    <p className='text-sm sm:text-base text-gray-400'>Subscribe for weekly trading insights and market data.</p>
                </div>
                <div className='mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4'>
                    <Input
                        placeholder='Enter your email'
                        readOnly
                        onClick={openSubscribeFlow}
                        className='h-12 sm:h-14 flex-1 rounded-xl bg-black/35 border-white/10 text-white placeholder:text-white/40 backdrop-blur-md'
                    />
                    <Button
                        onClick={openSubscribeFlow}
                        disabled={authLoading || checkingAccess}
                        className='h-12 sm:h-14 rounded-xl px-8 font-black text-base bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] shadow-xl shadow-[#2c7bbe]/30'
                    >
                        {checkingAccess ? 'Checking…' : 'Subscribe'}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {authOpen && (
                <AuthModal
                    open={authOpen}
                    onOpenChange={(open) => {
                        setAuthOpen(open);
                        if (open) setPricingOpen(false);
                    }}
                    defaultView='signup'
                    sourceRoute='/'
                    onSuccess={handleAuthSuccess}
                />
            )}

            {/* ─── HERO SECTION ─── */}
            <section className='relative flex items-center justify-center py-10 sm:py-14 min-[1100px]:py-14 px-4 sm:px-6 md:px-8 lg:px-8 min-h-[calc(100vh-64px)] min-[1100px]:min-h-0'>
                <div className='absolute inset-0'>
                    <div className='absolute inset-0 bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/blacksnowbgimage.webp')" }} />
                    <div className='absolute inset-0 bg-black/90' />
                </div>

                <div className='relative z-10 w-full max-w-[1160px] mx-auto'>
                    <div className='grid min-[1100px]:grid-cols-2 items-center'>
                        {/* LEFT */}
                        <div className='flex flex-col gap-7 min-[1100px]:gap-8 min-w-0'>
                            <div className='space-y-3 animate-slide-in-left delay-200'>
                                <h1 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight'>
                                    <span className='text-[#f4f4f4] whitespace-nowrap'>Global Multi-Asset</span>
                                    <br />
                                    <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2a8dcc] to-[#2c7bbe] bg-clip-text text-transparent font-black whitespace-nowrap'>
                                        Intelligence Engine
                                    </span>
                                </h1>

                                <p className='text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed max-w-xl font-light'>
                                    Data-driven global paper trading, stock screening, watchlists, and economic KPI&apos;s
                                </p>
                            </div>

                            {/* Mobile animation */}
                            <div className='block min-[1100px]:hidden w-full animate-slide-in-left delay-300'>
                                <div className='flex items-center justify-center w-full rounded-2xl border border-[#2c7bbe]/20 bg-[#07131a]/50'>
                                    <LottieAnimation
                                        src='/animations/growthChartIcon.json'
                                        className='w-full h-[220px] xs:h-[250px]'
                                        loop={true}
                                        autoplay={true}
                                    />
                                </div>
                            </div>

                            <div className='animate-slide-in-left delay-400 overflow-hidden w-full'>
                                <NewsletterSubscribeBar />
                            </div>
                        </div>

                        {/* RIGHT — desktop only */}
                        <div className='hidden min-[1100px]:flex relative animate-slide-in-right w-full items-center justify-center'>
                            <div className='w-full max-w-[440px] aspect-square bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-3xl border border-[#2c7bbe]/20 overflow-hidden'>
                                <LottieAnimation src='/animations/growthChartIcon.json' className='w-full h-full' loop={true} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── MODALS ─── */}

            {/* 1) Checking Entitlement Loader */}
            <Dialog open={isCheckingOpen} onOpenChange={setIsCheckingOpen}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <DialogHeader className='space-y-2'>
                        <DialogTitle className='text-2xl font-black text-white'>Checking access…</DialogTitle>
                        <DialogDesc className='text-[#4cc7e8] font-semibold'>Verifying your newsletter subscription status</DialogDesc>
                    </DialogHeader>
                    <div className='flex flex-col items-center justify-center py-8'>
                        <div className='w-10 h-10 rounded-full border-4 border-[#2c7bbe]/30 border-t-[#4cc7e8] animate-spin'></div>
                        {entitlementError && <p className='text-red-400 mt-6 text-sm text-center'>{entitlementError}</p>}
                        {entitlementError && (
                            <Button
                                onClick={() => setIsCheckingOpen(false)}
                                className='mt-4 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white font-black'
                            >
                                Close
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* 2) Subscribe Form */}
            <Dialog open={isSubscribeFormOpen} onOpenChange={setIsSubscribeFormOpen}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <button
                        onClick={() => setIsSubscribeFormOpen(false)}
                        className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                    >
                        <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                    </button>
                    <DialogHeader className='space-y-6 pb-6'>
                        <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                <Calendar className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Subscribe to Newsletter</DialogTitle>
                                <DialogDesc className='text-[#4cc7e8] font-semibold'>Enter your details to receive updates.</DialogDesc>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className='space-y-5'>
                        <div>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder='Enter your first name'
                                className='bg-[#050608]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-400'
                            />
                            <FieldError msg={formErrors.firstName} />
                        </div>
                        <div>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder='Enter your last name'
                                className='bg-[#050608]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-400'
                            />
                            <FieldError msg={formErrors.lastName} />
                        </div>
                        <div>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type='email'
                                placeholder='Enter your email'
                                className='bg-[#050608]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-400'
                            />
                            <FieldError msg={formErrors.email} />
                        </div>
                        <div className='flex items-start space-x-3'>
                            <input
                                id='agree'
                                type='checkbox'
                                checked={agree}
                                onChange={(e) => setAgree(e.target.checked)}
                                className='mt-1 w-4 h-4 rounded border-[#2c7bbe]/40 bg-transparent'
                            />
                            <label htmlFor='agree' className='text-sm text-gray-300'>
                                I agree to the <span className='text-[#4cc7e8] underline underline-offset-2 cursor-pointer'>terms and policies</span>.
                            </label>
                        </div>
                        <FieldError msg={formErrors.agree} />
                        <Button
                            onClick={submitNewsletter}
                            className='w-full cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-black py-3 text-lg shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl'
                            disabled={submitLoading}
                        >
                            {submitLoading ? 'Submitting…' : 'Submit'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 3) Success Modal */}
            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
                <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                    <DialogHeader className='space-y-6 pb-2'>
                        <div className='flex items-center space-x-4'>
                            <div className='min-w-12 min-h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                <CheckCircle className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Request Submitted</DialogTitle>
                                <DialogDesc className='text-[#4cc7e8] font-semibold'>
                                    Your request was submitted successfully. We will inform you further via email.
                                </DialogDesc>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className='pt-2'>
                        <Button
                            onClick={() => setIsSuccessModalOpen(false)}
                            className='w-full cursor-pointer bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-black py-3 text-lg shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl'
                        >
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 4) Pricing Modal */}
            {!authOpen && <PricingComponent name='NewsLetter' asModal open={pricingOpen} onOpenChange={setPricingOpen} />}
        </>
    );
}
