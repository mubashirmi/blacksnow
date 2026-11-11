// components/HeroSection.tsx
import AuthModal from '@/components/AuthModal';
import HeroTradingCarousel from '@/components/HeroTradingCarousel';
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
                    <div className='grid min-[1100px]:grid-cols-2 items-center min-[1100px]:items-stretch'>
                        {/* ── LEFT ── */}
                        <div className='flex flex-col gap-7 min-[1100px]:gap-8 min-w-0'>
                            <div className='space-y-3 animate-slide-in-left delay-200'>
                                <h1 className='text-[clamp(1.45rem,6.2vw,2rem)] sm:text-4xl md:text-5xl min-[1100px]:text-[clamp(1.85rem,2.65vw,3.1rem)] font-black leading-[1.2] min-[1100px]:leading-[1.22] tracking-tight'>
                                    <span className='text-[#f4f4f4] whitespace-nowrap'>Global Multi-Asset</span>
                                    <br />
                                    <span className='font-black whitespace-nowrap text-[#4333AF]'>Intelligence Engine</span>
                                </h1>
                                <p className='text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed max-w-xl font-light'>
                                    Data-driven global paper trading, stock screening, watchlists, and economic KPI&apos;s
                                </p>
                            </div>
                            {/* Mobile animation */}
                            <div className='block min-[1100px]:hidden w-full animate-slide-in-left delay-300'>
                                <div className='home-hero-lottie-surface flex items-center justify-center w-full rounded-2xl border border-[#414A5D] bg-transparent'>
                                    <LottieAnimation
                                        src='/animations/growthChartIcon.json'
                                        className='w-full h-[220px] xs:h-[250px] bg-transparent'
                                        loop={true}
                                        autoplay={true}
                                    />
                                </div>
                            </div>
                            <div className='animate-slide-in-left delay-400 w-full min-w-0'>
                                <HeroTradingCarousel onSubscribe={openSubscribeFlow} disabled={authLoading || checkingAccess} checkingAccess={checkingAccess} />
                            </div>
                        </div>
                        {/* ── RIGHT — desktop only ── */}
                        <div className='hidden min-[1100px]:flex relative animate-slide-in-right w-full self-stretch items-center justify-center'>
                            <div className='home-hero-lottie-surface w-full max-w-[440px] h-full min-h-[490px] max-h-[530px] rounded-3xl border border-[#414A5D] overflow-hidden bg-transparent'>
                                <LottieAnimation src='/animations/growthChartIcon.json' className='w-full h-full bg-transparent' loop={true} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* --- MODALS --- */}
            {/* 1) Checking Entitlement Loader */}
            <Dialog open={isCheckingOpen} onOpenChange={setIsCheckingOpen}>
                <DialogContent className='sm:max-w-md border-2 border-[#414A5D] shadow-2xl shadow-[#4333AF]/15 backdrop-blur-2xl bg-[#0C0F18]'>
                    <DialogHeader className='space-y-2'>
                        <DialogTitle className='text-2xl font-black text-white'>Checking access…</DialogTitle>
                        <DialogDesc className='text-[#4333AF] font-semibold'>Verifying your newsletter subscription status</DialogDesc>
                    </DialogHeader>
                    <div className='flex flex-col items-center justify-center py-8'>
                        <div className='w-10 h-10 rounded-full border-4 border-[#414A5D] border-t-[#4333AF] animate-spin'></div>
                        {entitlementError && <p className='text-red-400 mt-6 text-sm text-center'>{entitlementError}</p>}
                        {entitlementError && (
                            <Button onClick={() => setIsCheckingOpen(false)} className='mt-4 text-white font-black bg-[#4333AF]'>
                                Close
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            {/* 2) Subscribe Form */}
            <Dialog open={isSubscribeFormOpen} onOpenChange={setIsSubscribeFormOpen}>
                <DialogContent className='sm:max-w-md border-2 border-[#414A5D] shadow-2xl shadow-[#4333AF]/15 backdrop-blur-2xl bg-[#0C0F18]'>
                    <button
                        onClick={() => setIsSubscribeFormOpen(false)}
                        className='absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center border border-[#414A5D] hover:border-[#4333AF] transition-all duration-300 group z-10 bg-[#4333AF] hover:bg-[#372990]'
                    >
                        <X className='w-4 h-4 text-[#4333AF] group-hover:text-white transition-colors duration-300' />
                    </button>
                    <DialogHeader className='space-y-6 pb-6'>
                        <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl bg-[#4333AF]'>
                                <Calendar className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Subscribe to Newsletter</DialogTitle>
                                <DialogDesc className='text-[#4333AF] font-semibold'>Enter your details to receive updates.</DialogDesc>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className='space-y-5'>
                        <div>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder='Enter your first name'
                                className='bg-[#050608] border-[#414A5D] text-white placeholder:text-gray-400'
                            />
                            <FieldError msg={formErrors.firstName} />
                        </div>
                        <div>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder='Enter your last name'
                                className='bg-[#050608] border-[#414A5D] text-white placeholder:text-gray-400'
                            />
                            <FieldError msg={formErrors.lastName} />
                        </div>
                        <div>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type='email'
                                placeholder='Enter your email'
                                className='bg-[#050608] border-[#414A5D] text-white placeholder:text-gray-400'
                            />
                            <FieldError msg={formErrors.email} />
                        </div>
                        <div className='flex items-start space-x-3'>
                            <input
                                id='agree'
                                type='checkbox'
                                checked={agree}
                                onChange={(e) => setAgree(e.target.checked)}
                                className='mt-1 w-4 h-4 rounded border-[#414A5D] bg-transparent'
                            />
                            <label htmlFor='agree' className='text-sm text-gray-300'>
                                I agree to the <span className='text-[#4333AF] underline underline-offset-2 cursor-pointer'>terms and policies</span>.
                            </label>
                        </div>
                        <FieldError msg={formErrors.agree} />
                        <Button
                            onClick={submitNewsletter}
                            className='w-full cursor-pointer text-white font-black py-3 text-lg shadow-2xl shadow-[#4333AF]/15 hover:shadow-[#4333AF]/15 transition-all duration-500 transform hover:scale-105 rounded-2xl bg-[#4333AF] hover:bg-[#372990]'
                            disabled={submitLoading}
                        >
                            {submitLoading ? 'Submitting…' : 'Submit'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* 3) Success Modal */}
            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
                <DialogContent className='sm:max-w-md border-2 border-[#414A5D] shadow-2xl shadow-[#4333AF]/15 backdrop-blur-2xl bg-[#0C0F18]'>
                    <DialogHeader className='space-y-6 pb-2'>
                        <div className='flex items-center space-x-4'>
                            <div className='min-w-12 min-h-12 rounded-2xl flex items-center justify-center shadow-xl bg-[#4333AF]'>
                                <CheckCircle className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-black text-white'>Request Submitted</DialogTitle>
                                <DialogDesc className='text-[#4333AF] font-semibold'>
                                    Your request was submitted successfully. We will inform you further via email.
                                </DialogDesc>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className='pt-2'>
                        <Button
                            onClick={() => setIsSuccessModalOpen(false)}
                            className='w-full cursor-pointer text-white font-black py-3 text-lg shadow-2xl shadow-[#4333AF]/15 hover:shadow-[#4333AF]/15 transition-all duration-500 transform hover:scale-105 rounded-2xl bg-[#4333AF] hover:bg-[#372990]'
                        >
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* <HomeTourPopup /> */}
            {/* 4) Pricing Modal */}
            {!authOpen && <PricingComponent name='NewsLetter' asModal open={pricingOpen} onOpenChange={setPricingOpen} />}
        </>
    );
}
