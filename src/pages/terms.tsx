import LegalDocumentPage from '@/components/legal/LegalDocumentPage';
import { legalDocuments } from '@/lib/legal-documents';

export default function Page() {
    return <LegalDocumentPage document={legalDocuments[2]} />;
}
