import { Role } from '@prisma/client';

import prisma from '@/lib/prisma';

function isRole(value: string): value is Role {
    return (Object.values(Role) as string[]).includes(value);
}

async function addRoleIfMissing(authId: number, role: Role): Promise<void> {
    await prisma.auth.updateMany({
        where: {
            id: authId,
            NOT: {
                roles: {
                    has: role,
                },
            },
        },
        data: {
            roles: {
                push: role,
            },
        },
    });
}

/**
 * Repair users whose paid checkouts predate server-side role activation.
 */
export async function syncPaidCheckoutRoles(authId: number): Promise<void> {
    const checkouts = await prisma.checkout.findMany({
        where: {
            AuthId: authId,
            paid: true,
            deleted: false,
            cancelSubscripton: false,
            product: {
                not: null,
            },
        },
        select: {
            product: true,
        },
    });

    const roles = Array.from(new Set(checkouts.map((checkout) => checkout.product).filter((product): product is Role => product !== null && isRole(product))));

    for (const role of roles) {
        await addRoleIfMissing(authId, role);
    }
}

/**
 * Mark a Stripe checkout as paid and persist its product in Auth.roles.
 *
 * The guarded updateMany keeps this safe when both the success page and the
 * Stripe webhook process the same session, without adding the role twice.
 */
export async function activateCheckoutAccess(transactionId: string): Promise<number> {
    return prisma.$transaction(async (transaction) => {
        const checkout = await transaction.checkout.findFirst({
            where: {
                transactionId,
                deleted: false,
            },
            select: {
                AuthId: true,
                product: true,
            },
        });

        if (!checkout) {
            return 0;
        }

        const updateResult = await transaction.checkout.updateMany({
            where: {
                transactionId,
                deleted: false,
            },
            data: {
                paid: true,
                updatedAt: new Date(),
            },
        });

        if (checkout.product && isRole(checkout.product)) {
            const productRole = checkout.product;

            await transaction.auth.updateMany({
                where: {
                    id: checkout.AuthId,
                    NOT: {
                        roles: {
                            has: productRole,
                        },
                    },
                },
                data: {
                    roles: {
                        push: productRole,
                    },
                },
            });
        }

        return updateResult.count;
    });
}
