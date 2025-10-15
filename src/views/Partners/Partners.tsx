import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Globe, Linkedin, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function Partners() {
    const partners = [
        {
            id: 1,
            name: 'Goldman Sachs',
            logo: '/placeholder.svg?height=80&width=80',
            image: '/placeholder.svg?height=200&width=300',
            description:
                'Leading global investment banking, securities and investment management firm providing services to corporations, financial institutions and governments.',
            category: 'Investment Banking',
            partnership: 'Strategic Partner',
            since: '2019',
            social: {
                linkedin: 'https://linkedin.com/company/goldman-sachs',
                twitter: 'https://twitter.com/goldmansachs',
                website: 'https://goldmansachs.com',
            },
        },
        {
            id: 2,
            name: 'JPMorgan Chase',
            logo: '/placeholder.svg?height=80&width=80',
            image: '/placeholder.svg?height=200&width=300',
            description:
                'Multinational investment bank and financial services company offering investment banking, asset management, and private banking services.',
            category: 'Commercial Banking',
            partnership: 'Technology Partner',
            since: '2020',
            social: {
                linkedin: 'https://linkedin.com/company/jpmorgan-chase',
                twitter: 'https://twitter.com/jpmorgan',
                website: 'https://jpmorganchase.com',
            },
        },
        {
            id: 3,
            name: 'BlackRock',
            logo: '/placeholder.svg?height=80&width=80',
            image: '/placeholder.svg?height=200&width=300',
            description:
                "World's largest asset manager providing investment management, risk management, and advisory services to institutional and retail clients.",
            category: 'Asset Management',
            partnership: 'Data Partner',
            since: '2021',
            social: {
                linkedin: 'https://linkedin.com/company/blackrock',
                twitter: 'https://twitter.com/blackrock',
                website: 'https://blackrock.com',
            },
        },
        {
            id: 4,
            name: 'Morgan Stanley',
            logo: '/placeholder.svg?height=80&width=80',
            image: '/placeholder.svg?height=200&width=300',
            description: 'Global financial services firm providing investment banking, securities, wealth management and investment management services.',
            category: 'Investment Services',
            partnership: 'Research Partner',
            since: '2018',
            social: {
                linkedin: 'https://linkedin.com/company/morgan-stanley',
                twitter: 'https://twitter.com/morganstanley',
                website: 'https://morganstanley.com',
            },
        },
        {
            id: 5,
            name: 'Citadel Securities',
            logo: '/placeholder.svg?height=80&width=80',
            image: '/placeholder.svg?height=200&width=300',
            description: 'Leading market maker providing liquidity and execution services across multiple asset classes and global markets.',
            category: 'Market Making',
            partnership: 'Execution Partner',
            since: '2022',
            social: {
                linkedin: 'https://linkedin.com/company/citadel-securities',
                twitter: 'https://twitter.com/citadelsecurities',
                website: 'https://citadelsecurities.com',
            },
        },
        {
            id: 6,
            name: 'Two Sigma',
            logo: '/placeholder.svg?height=80&width=80',
            image: '/placeholder.svg?height=200&width=300',
            description:
                'Technology-driven investment manager using artificial intelligence, machine learning and distributed computing for systematic trading.',
            category: 'Quantitative Trading',
            partnership: 'AI Partner',
            since: '2023',
            social: {
                linkedin: 'https://linkedin.com/company/two-sigma',
                twitter: 'https://twitter.com/twosigma',
                website: 'https://twosigma.com',
            },
        },
    ];

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Investment Banking':
                return 'from-blue-500 to-indigo-500';
            case 'Commercial Banking':
                return 'from-green-500 to-emerald-500';
            case 'Asset Management':
                return 'from-purple-500 to-pink-500';
            case 'Investment Services':
                return 'from-orange-500 to-red-500';
            case 'Market Making':
                return 'from-teal-500 to-cyan-500';
            case 'Quantitative Trading':
                return 'from-yellow-500 to-amber-500';
            default:
                return 'from-gray-500 to-slate-500';
        }
    };

    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            {/* Header */}
            <div className='relative z-10 pt-32 pb-20 px-6'>
                <div className='container mx-auto max-w-7xl text-center'>
                    <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-8 px-8 py-3 text-sm font-bold'>ELITE NETWORK</Badge>

                    <h1 className='text-5xl lg:text-7xl font-black text-white mb-6 animate-slide-in-up delay-200'>
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Our </span>
                        <span className='text-white'>&nbsp;Partners</span>
                    </h1>

                    <p className='text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-slide-in-up delay-400'>
                        Collaborating with the world&apos;s leading financial institutions to deliver exceptional trading solutions
                    </p>
                </div>
            </div>

            {/* Partners Grid */}
            <div className='relative z-10 px-6 pb-32'>
                <div className='container mx-auto max-w-7xl'>
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {partners.map((partner, index) => (
                            <div key={partner.id} className='group relative animate-slide-in-up' style={{ animationDelay: `${index * 100}ms` }}>
                                {/* Glowing Background Effect */}
                                <div className='absolute inset-0 bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60'></div>

                                <Card className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/20 hover:border-[#4cc7e8]/40 transition-all duration-500 rounded-3xl overflow-hidden transform hover:scale-105 hover:-translate-y-2 shadow-xl shadow-[#2c7bbe]/10 group'>
                                    {/* Top Border */}
                                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]'></div>

                                    {/* Partner Image */}
                                    <div className='relative overflow-hidden'>
                                        <Image
                                            src={partner.image || '/placeholder.svg'}
                                            alt={partner.name}
                                            width={300}
                                            height={200}
                                            className='w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500'
                                        />
                                        <div className='absolute inset-0 bg-gradient-to-t from-[#050608]/60 via-transparent to-transparent'></div>

                                        {/* Category Badge */}
                                        <div className='absolute top-4 left-4'>
                                            <Badge className={`bg-gradient-to-r ${getCategoryColor(partner.category)} text-white border-0 font-bold`}>
                                                {partner.category}
                                            </Badge>
                                        </div>

                                        {/* Partnership Type */}
                                        <div className='absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1'>
                                            <span className='text-white text-xs font-semibold'>{partner.partnership}</span>
                                        </div>
                                    </div>

                                    <CardHeader className='p-6'>
                                        <div className='flex items-center space-x-4 mb-4'>
                                            <div className='w-16 h-16 bg-white rounded-2xl p-2 shadow-lg'>
                                                <Image
                                                    src={partner.logo || '/placeholder.svg'}
                                                    alt={`${partner.name} logo`}
                                                    width={80}
                                                    height={80}
                                                    className='w-full h-full object-contain'
                                                />
                                            </div>
                                            <div>
                                                <CardTitle className='text-xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                                    {partner.name}
                                                </CardTitle>
                                                <CardDescription className='text-[#4cc7e8] font-semibold'>Partner since {partner.since}</CardDescription>
                                            </div>
                                        </div>
                                        <p className='text-gray-300 leading-relaxed text-sm line-clamp-3'>{partner.description}</p>
                                    </CardHeader>

                                    <CardContent className='p-6 pt-0'>
                                        {/* Social Media Links */}
                                        <div className='flex items-center justify-between mb-6'>
                                            <span className='text-gray-400 text-sm font-semibold'>Connect with {partner.name}</span>
                                            <div className='flex items-center space-x-3'>
                                                <Link
                                                    href={partner.social.website}
                                                    className='w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-lg flex items-center justify-center hover:from-[#2c7bbe]/40 hover:to-[#4cc7e8]/40 transition-all duration-300'
                                                >
                                                    <Globe className='w-4 h-4 text-[#4cc7e8]' />
                                                </Link>
                                                <Link
                                                    href={partner.social.linkedin}
                                                    className='w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-lg flex items-center justify-center hover:from-[#2c7bbe]/40 hover:to-[#4cc7e8]/40 transition-all duration-300'
                                                >
                                                    <Linkedin className='w-4 h-4 text-[#4cc7e8]' />
                                                </Link>
                                                <Link
                                                    href={partner.social.twitter}
                                                    className='w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-lg flex items-center justify-center hover:from-[#2c7bbe]/40 hover:to-[#4cc7e8]/40 transition-all duration-300'
                                                >
                                                    <Twitter className='w-4 h-4 text-[#4cc7e8]' />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Visit Partner Button */}
                                        <Button
                                            asChild
                                            className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold transition-all duration-300 group/btn'
                                        >
                                            <Link href={partner.social.website} target='_blank'>
                                                Visit Partner
                                                <ExternalLink className='w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300' />
                                            </Link>
                                        </Button>
                                    </CardContent>

                                    {/* Floating Elements */}
                                    <div className='absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse'></div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export { Partners };
