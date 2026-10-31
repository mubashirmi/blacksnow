import { createAdminReportHandler } from '@/lib/adminUserReportApi';
import { getAllBusinessInvoiceEarnings } from '@/lib/adminUserReports';
import { parseRevenueCurrency } from '@/lib/subscriptionPlatformRevenue';

export default createAdminReportHandler((req) => getAllBusinessInvoiceEarnings(parseRevenueCurrency(req.query.currency)));
