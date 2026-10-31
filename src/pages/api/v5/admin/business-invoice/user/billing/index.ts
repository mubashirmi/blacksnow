import { createAdminReportHandler } from '@/lib/adminUserReportApi';
import { getAllBusinessInvoiceBilling } from '@/lib/adminUserReports';

export default createAdminReportHandler(() => getAllBusinessInvoiceBilling());
