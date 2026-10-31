import { createAdminReportHandler } from '@/lib/adminUserReportApi';
import { getAllEmailCrmUsage } from '@/lib/adminUserReports';

export default createAdminReportHandler(() => getAllEmailCrmUsage());
