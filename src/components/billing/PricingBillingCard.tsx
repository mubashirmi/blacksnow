import Image from 'next/image';

/**
 * Black Snow card based on the public pricing page hero credit card.
 * Intentionally static: no animation, gradients, or animated lighting.
 */
export function PricingBillingCard() {
    return (
        <div className='relative mx-auto mt-10 h-[255px] w-full max-w-[350px] overflow-hidden rounded-[28px] border border-[#4cc7e8]/30 bg-[#0b1720] shadow-[0_22px_46px_-25px_rgba(0,0,0,0.4)] sm:h-[310px] sm:max-w-[470px] lg:aspect-[530/335] lg:h-auto lg:max-w-[530px]'>
            <div className='absolute inset-0 flex items-center justify-center'>
                <div className='relative h-[72%] w-[82%] sm:h-[76%] sm:w-[84%]'>
                    <Image
                        src='/logocolored.png'
                        alt='Black Snow Holdings logo'
                        fill
                        priority
                        sizes='(max-width: 640px) 350px, 500px'
                        className='object-contain'
                    />
                </div>
            </div>

            {/* Identical chip placement and silhouette to the pricing hero. */}
            <div className='pointer-events-none absolute left-6 top-1/2 z-10 -translate-y-1/2 sm:left-9'>
                <svg
                    className='h-[21px] w-[28px] sm:h-[24px] sm:w-[32px]'
                    viewBox='0 0 64 48'
                    role='img'
                    aria-label='Gold payment card chip'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <rect x='1' y='1' width='62' height='46' rx='8' fill='#E8C46E' stroke='#FFE1A0' strokeWidth='1.2' />
                    <g fill='none' stroke='#9C7137' strokeWidth='1.5' strokeLinejoin='round' opacity='0.88'>
                        <path d='M1 15 H18 M1 33 H18 M46 15 H63 M46 33 H63' />
                        <path d='M18 1 V15 M46 1 V15 M18 33 V47 M46 33 V47' />
                        <path d='M32 1 V14 M32 34 V47 M1 24 H18 M46 24 H63' />
                        <rect x='18' y='14' width='28' height='20' rx='5' />
                    </g>
                    <rect x='21.5' y='17.5' width='21' height='13' rx='3.5' fill='none' stroke='#FFF1BA' strokeWidth='0.9' opacity='0.75' />
                </svg>
            </div>
        </div>
    );
}
