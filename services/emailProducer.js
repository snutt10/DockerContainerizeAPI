const { consumer } = require('./consumer');
const { createTransporter } = require('../config/email');
const User = require('../models/User');
const sendEmail = require('email');

async function run() {
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-events', fromBeginning: false });
    await consumer.subscribe({ topic: 'offer-events', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
        const event = JSON.parse(message.value.toString());

        switch (topic) {
            case 'user-events':
                if (event.eventType === 'PASSWORD_CHANGED') {
                    const user = await User.findById(event.userId);
                    await sendEmail(user.email, 'Your password was changed');
                }
                break;

            case 'offer-events':
                const initiatingUser = await User.findById(event.initiatingUserId);
                const targetUser = await User.findById(event.targetUserId);
                if (event.eventType === 'OFFER_CREATED') {
                    await sendEmail(initiatingUser.email, 'Offer created');
                    await sendEmail(targetUser.email, 'You received a new offer');
                } else if (event.eventType === 'OFFER_ACCEPTED') {
                    await sendEmail(initiatingUser.email, 'Your offer was accepted');
                    await sendEmail(targetUser.email, 'You accepted an offer');
                } else if (event.eventType === 'OFFER_REJECTED') {
                    await sendEmail(initiatingUser.email, 'Your offer was rejected');
                    await sendEmail(targetUser.email, 'You rejected an offer');
                }
                break;
        }
        }
    });
};

run().catch(console.error);
