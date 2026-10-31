import { createAdminReportHandler } from '@/lib/adminUserReportApi';
import { getAllLightningSubscriptions } from '@/lib/adminUserReports';

export default createAdminReportHandler(() => getAllLightningSubscriptions('LightningSilver'));
