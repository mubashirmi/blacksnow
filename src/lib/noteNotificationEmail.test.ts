import { buildOtpHtml } from '@/pages/api/auth/auth-email';

import { buildNoteNotificationHtml } from './noteNotificationEmail';

describe('note notification email template', () => {
    test('reuses the OTP email visual system and safely renders note content', () => {
        const otpHtml = buildOtpHtml('Ada', 123456);
        const noteHtml = buildNoteNotificationHtml({
            recipientName: '<Ada>',
            title: '<Important>',
            content: 'First line\n<script>alert(1)</script>',
            authorName: 'Support & Billing',
        });

        for (const style of ['background-color:#f4f6fb', 'max-width:620px', 'border-radius:18px', 'box-shadow:0 12px 40px rgba(0,0,0,0.12)']) {
            expect(otpHtml).toContain(style);
            expect(noteHtml).toContain(style);
        }

        expect(noteHtml).toContain('cid:blacksnow-logo');
        expect(noteHtml).toContain('&lt;Important&gt;');
        expect(noteHtml).toContain('First line<br />&lt;script&gt;alert(1)&lt;/script&gt;');
        expect(noteHtml).not.toContain('<script>alert(1)</script>');
    });
});
