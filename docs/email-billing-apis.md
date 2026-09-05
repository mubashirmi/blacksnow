# Email usage and billing APIs

All dates and monthly limits use UTC. These read endpoints do not require a token
or session. Supply `authId` to inspect one user, or omit it to return all active
users who have the `EmailMarketing` role.

## Monthly usage as of a date

`GET /api/v5/email-billing/usage?date=2026-09-04&authId=123`

`date` is optional and defaults to the current UTC date. Usage is returned for
the UTC calendar month through the selected date. `authId` is optional.

```json
{
    "success": true,
    "data": {
        "date": "2026-09-04",
        "timezone": "UTC",
        "userCount": 1,
        "users": [
            {
                "user": { "id": 123, "email": "user@example.com", "firstName": "A", "lastName": "User" },
                "billingMonth": "2026-09",
                "emailsSentToday": 100,
                "emailsSentThisMonth": 100050,
                "monthlyLimit": 100000,
                "remainingMonthlyUsage": 0,
                "monthlyOverageEmailCount": 50
            }
        ]
    }
}
```

## Current-day overage bill

`GET /api/v5/email-billing/overage/current?authId=123`

The response includes today's sent count, month-to-date usage, the allowance
remaining at the start of the day, today's billable overage, and any automatic
charge record already created today.

```json
{
    "success": true,
    "data": {
        "date": "2026-09-04",
        "timezone": "UTC",
        "userCount": 1,
        "users": [
            {
                "user": { "id": 123, "email": "user@example.com", "firstName": "A", "lastName": "User" },
                "billingMonth": "2026-09",
                "emailsSentToday": 100,
                "emailsSentThisMonth": 100050,
                "monthlyLimit": 100000,
                "remainingMonthlyAllowanceAtStartOfDay": 50,
                "overageEmailCount": 50,
                "ratePerOverageEmail": { "amount": 0.005, "currency": "USD" },
                "totalCharge": { "amount": 0.25, "currency": "USD" },
                "automaticCharge": null
            }
        ]
    }
}
```

## Historical overage bill

`GET /api/v5/email-billing/overage/history?date=2026-09-03&authId=123`

`date` is required, must be a real `YYYY-MM-DD` date, and cannot be in the
future. Stored monthly limit and rate snapshots are used when available. The
daily bill includes only emails sent after that month's remaining allowance was
used up.

The response has the same `data` structure as the current-day endpoint.

## Automatic charge transactions

`GET /api/v5/email-billing/transactions?authId=123&page=1&limit=25`

`page` defaults to `1`. `limit` defaults to `25` and cannot exceed `100`.
Transactions of every status are returned; aggregate amount and successful
count include only `SUCCEEDED` charges.

```json
{
    "success": true,
    "data": {
        "transactionCount": 2,
        "successfulTransactionCount": 1,
        "totalAmountCharged": { "amount": 1.25, "currency": "USD" },
        "transactions": [
            {
                "id": 42,
                "user": { "id": 123, "email": "user@example.com" },
                "billingDate": "2026-09-04",
                "billingMonth": "2026-09",
                "amount": { "amount": 1.25, "currency": "USD" },
                "status": "SUCCEEDED",
                "chargedAt": "2026-09-04T23:59:00.000Z",
                "createdAt": "2026-09-04T23:59:00.000Z",
                "stripePaymentIntentId": "pi_example",
                "failure": null
            }
        ],
        "pagination": { "page": 1, "limit": 25, "totalPages": 1 }
    }
}
```

Validation errors use a consistent envelope:

```json
{
    "success": false,
    "error": { "code": "INVALID_DATE", "message": "date must use YYYY-MM-DD format" }
}
```
