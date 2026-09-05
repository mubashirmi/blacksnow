import dynamic from 'next/dynamic';

const ProfessionalContractEditor = dynamic(() => import('../../../../components/contracts/ProfessionalContractEditor'), { ssr: false });

const ADMIN_AUTH_ID = 5;

export default function AdminContractEditorPage() {
    return (
        <ProfessionalContractEditor
            authId={String(ADMIN_AUTH_ID)}
            backHref='/admin/dashboard/invoicecontractdashboard/contract'
            editorTitle='Admin Contract Studio'
        />
    );
}
