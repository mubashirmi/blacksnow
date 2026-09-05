// pages/index.tsx or pages/home.tsx (or any page you'd like)
import DataDrivenMarketHub from '@/components/DataDrivenMarketHub';
import HeroSection from '@/components/MainHeroSection';

export default function HomePage() {
    return (
        <div className='min-h-screen bg-[#050608]'>
            <HeroSection />
            <DataDrivenMarketHub />
        </div>
    );
}
