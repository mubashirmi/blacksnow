import { createAdminReportHandler } from '@/lib/adminUserReportApi';
import { getAllEmailCrmBilling } from '@/lib/adminUserReports';
import { parsePagination } from '@/lib/emailBillingValidation';

export default createAdminReportHandler((req) => {
    const { page, limit } = parsePagination(req.query);
    return getAllEmailCrmBilling(page, limit);
});
