import { createAdminReportHandler } from '@/lib/adminUserReportApi';
import { getAllLightningReferralEarnings } from '@/lib/adminUserReports';

export default createAdminReportHandler(() => getAllLightningReferralEarnings('LightningSilver'));
