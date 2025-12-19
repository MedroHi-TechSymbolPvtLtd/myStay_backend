"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const templates = [
        {
            id: 'enrollment_confirm',
            name: 'Enrollment Confirmation',
            channel: 'multi',
            title: 'Welcome to myStay',
            body: 'Hi {{name}}, your enrollment is confirmed. Welcome aboard!',
            variables: { name: 'string' },
        },
        {
            id: 'payment_success',
            name: 'Payment Successful',
            channel: 'multi',
            title: 'Payment Received',
            body: 'Hi {{name}}, we received your payment of {{amount}}. Transaction ID: {{transactionId}}.',
            variables: { name: 'string', amount: 'number', transactionId: 'string' },
        },
        {
            id: 'ticket_ack',
            name: 'Ticket Acknowledged',
            channel: 'multi',
            title: 'Ticket Received',
            body: 'Hi {{name}}, we received your ticket #{{ticketId}}. We will look into it shortly.',
            variables: { name: 'string', ticketId: 'string' },
        },
    ];
    for (const t of templates) {
        await prisma.template.upsert({
            where: { id: t.id },
            update: {},
            create: t,
        });
    }
    console.log('Seed data inserted');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
