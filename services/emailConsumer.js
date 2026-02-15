const { consumer } = require('./consumer');
const { createTransporter } = require('../config/email');
const User = require('../models/User');
const sendEmail = require('email');
const { text } = require('express');

let transporter;

async function initializeTransporter() {
    transporter = await createTransporter();
}

async function sendEmail(email, subject, body) {
    if (!transporter) {
        console.error('Email transporter not initialized');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: 'Game Exchange <noreply@gameExchange.com>',
            to: email,
            subject: subject,
            text: body,
            html: `<p>${body}</p>`,
        });
        
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', require('nodemailer').getTestMessageUrl(info));
        
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function run() {
    try {
        await initializeTransporter();
        console.log('Email transporter initialized');

        await consumer.connect();
        console.log('Email consumer connected to Kafka');

        await consumer.subscribe({ topic: 'user-events', fromBeginning: false });
        await consumer.subscribe({ topic: 'offer-events', fromBeginning: false });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {

                    const event = JSON.parse(message.value.toString());

                    switch (topic) {
                        case 'user-events':
                            if (event.eventType === 'PASSWORD_CHANGED') {
                                const user = await User.findById(event.userId);
                                if (user) {
                                    await sendEmail(user.email, 'Password Changed',
                                        `Hello ${user.username}, your password was changed successfully. If you did not initiate this change, please contact support immediately.`);
                                }
                            }
                            break;

                        case 'offer-events':
                            const initiatingUser = await User.findById(event.initiatingUserId);
                            const targetUser = await User.findById(event.targetUserId);

                            if (event.eventType === 'OFFER_CREATED') {
                                if (initiatingUser) {
                                    await sendEmail(initiatingUser.email, 'Offer created', `Hello ${initiatingUser.username}, your offer was created successfully.`);
                                }
                                if (targetUser) {
                                    await sendEmail(targetUser.email, 'You received a new offer', `Hello ${targetUser.username}, you received a new offer.`);
                                }
                            } else if (event.eventType === 'OFFER_ACCEPTED') {
                                if (initiatingUser) {
                                    await sendEmail(initiatingUser.email, 'Your offer was accepted', `Hello ${initiatingUser.username}, your offer was accepted.`);
                                }
                                if (targetUser) {
                                    await sendEmail(targetUser.email, 'You accepted an offer', `Hello ${targetUser.username}, you accepted an offer.`);
                                }
                            } else if (event.eventType === 'OFFER_REJECTED') {
                                if (initiatingUser) {
                                    await sendEmail(initiatingUser.email, 'Your offer was rejected', `Hello ${initiatingUser.username}, your offer was rejected.`);
                                }
                                if (targetUser) {
                                    await sendEmail(targetUser.email, 'You rejected an offer', `Hello ${targetUser.username}, you rejected an offer.`);
                                }
                            }
                            break;
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            }
        });
    } catch (error) {
        console.error('Error initializing email consumer:', error);
    }
};

run().catch(console.error);
