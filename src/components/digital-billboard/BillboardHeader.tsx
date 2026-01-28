export function BillboardHeader({
    view,
    onCreate,
    onBack,
    canCreateMore,
    usedCount,
    maxCount,
}: {
    view: 'list' | 'form';
    onCreate: () => void;
    onBack: () => void;
    canCreateMore: boolean;
    usedCount: number;
    maxCount: number;
}) {
    return (
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
            <div>
                <h1 className='text-3xl font-bold text-gray-900'>Digital Billboards</h1>
                <p className='text-gray-600 mt-1'>
                    Manage your billboards{' '}
                    <span className='text-gray-400'>
                        ({usedCount}/{maxCount})
                    </span>
                </p>
            </div>

            <div className='flex gap-3'>
                {view === 'list' ? (
                    <button
                        onClick={onCreate}
                        disabled={!canCreateMore}
                        className='px-5 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc]
              disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {usedCount === 0 ? 'Advertise your billboard' : 'Add another billboard'}
                    </button>
                ) : (
                    <button onClick={onBack} className='px-5 py-2.5 rounded-lg font-semibold text-white bg-gray-700 hover:bg-gray-600 transition-colors'>
                        Back
                    </button>
                )}
            </div>
        </div>
    );
}
