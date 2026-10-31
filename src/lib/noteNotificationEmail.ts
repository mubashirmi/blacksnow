import { BRAND_BLUE, BRAND_DARK, BRAND_NAME, BRAND_WHITE, LOGO_CONTENT_ID, escapeHtml } from '@/lib/emailBranding';

type NoteNotification = {
    recipientName: string;
    title: string;
    content: string;
    authorName?: string | null;
};

export function buildNoteNotificationText({ recipientName, title, content, authorName }: NoteNotification) {
    return `
Hi ${recipientName || 'there'},

A new note has been added for you by ${authorName || BRAND_NAME}.

${title}

${content}

Thank you,
${BRAND_NAME}
`;
}

export function buildNoteNotificationHtml({ recipientName, title, content, authorName }: NoteNotification) {
    const safeName = escapeHtml(recipientName || 'there');
    const safeTitle = escapeHtml(title);
    const safeContent = escapeHtml(content).replaceAll('\n', '<br />');
    const safeAuthor = escapeHtml(authorName || BRAND_NAME);

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${BRAND_NAME} Note Notification</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f6fb; font-family:Arial, Helvetica, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
      A new note has been added for you: ${safeTitle}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6fb; padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px; background-color:${BRAND_WHITE}; border-radius:18px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.12);">
            <tr>
              <td style="background-color:${BRAND_DARK}; padding:34px 28px; text-align:center;">
                <img src="cid:${LOGO_CONTENT_ID}" alt="${BRAND_NAME}" width="120" style="display:block; margin:0 auto 18px auto; max-width:120px; height:auto;" />
                <div style="color:${BRAND_WHITE}; font-size:24px; font-weight:700; letter-spacing:0.3px;">${BRAND_NAME}</div>
                <div style="color:#b9c7ff; font-size:14px; margin-top:8px;">New Note Notification</div>
              </td>
            </tr>

            <tr>
              <td style="padding:38px 32px 18px 32px;">
                <h1 style="margin:0 0 14px 0; color:#111827; font-size:26px; line-height:1.3; font-weight:700;">You have a new note</h1>
                <p style="margin:0 0 20px 0; color:#4b5563; font-size:16px; line-height:1.7;">Hi ${safeName},</p>
                <p style="margin:0 0 24px 0; color:#4b5563; font-size:16px; line-height:1.7;">
                  A new note has been added for you by <strong style="color:#111827;">${safeAuthor}</strong>.
                </p>

                <div style="background-color:#f1f5ff; border:2px solid ${BRAND_BLUE}; border-radius:16px; padding:22px 24px;">
                  <h2 style="margin:0 0 12px 0; color:${BRAND_BLUE}; font-size:20px; line-height:1.4; font-weight:700;">${safeTitle}</h2>
                  <p style="margin:0; color:#374151; font-size:15px; line-height:1.7;">${safeContent}</p>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 32px 34px 32px;">
                <div style="height:1px; background-color:#e5e7eb; margin-bottom:22px;"></div>
                <p style="margin:0; color:#6b7280; font-size:13px; line-height:1.7; text-align:center;">
                  This is an automated notification from <strong style="color:#111827;">${BRAND_NAME}</strong>.
                </p>
                <p style="margin:10px 0 0 0; color:#9ca3af; font-size:12px; line-height:1.6; text-align:center;">Please do not reply to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
