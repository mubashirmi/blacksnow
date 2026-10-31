import { createAdminReportHandler } from '@/lib/adminUserReportApi';
import { getAllDigitalBillboardSubscriptions } from '@/lib/adminUserReports';

export default createAdminReportHandler(() => getAllDigitalBillboardSubscriptions());
