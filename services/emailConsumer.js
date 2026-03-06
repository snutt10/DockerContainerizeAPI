const express = require('express');
const client = require('prom-client');
const { consumer } = require('./consumer');
const createTransporter = require('../config/email');
const { connectDB } = require('../config/db');
const User = require('../models/User');

const app = express();
const register = new client.Registry();
const PORT = process.env.PORT || 4000;

// Register default Node.js metrics
client.collectDefaultMetrics({ register, timeout: 5000 });

// Metrics for email processing
const emailsProcessed = new client.Counter({
    name: 'emails_processed_total',
    help: 'Total number of emails processed',
    labelNames: ['status', 'event_type'],
    registers: [register],
});

const messagesProcessed = new client.Counter({
    name: 'kafka_messages_processed_total',
    help: 'Total number of Kafka messages processed',
    labelNames: ['topic', 'status'],
    registers: [register],
});

let transporter;

async function initializeTransporter() {
    transporter = await createTransporter();
}

async function sendEmail(email, subject, body) {
    if (!transporter) {
        console.error('Email transporter not initialized');
        emailsProcessed.inc({ status: 'error', event_type: 'unknown' });
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
        emailsProcessed.inc({ status: 'success', event_type: 'email' });
        
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        emailsProcessed.inc({ status: 'error', event_type: 'email' });
    }
}

async function connectWithRetry(maxRetries = 10, delayMs = 5000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempting to connect to Kafka (attempt ${attempt}/${maxRetries})...`);
            
            await consumer.connect();
            console.log('Email consumer connected to Kafka');

            await consumer.subscribe({ topic: 'user-events', fromBeginning: false });
            await consumer.subscribe({ topic: 'offer-events', fromBeginning: false });
            
            console.log('Successfully subscribed to topics: user-events, offer-events');
            return true;
        } catch (error) {
            console.error(`Connection attempt ${attempt} failed:`, error.message);
            
            if (attempt < maxRetries) {
                console.log(`Waiting ${delayMs / 1000} seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } else {
                throw new Error('Max retries reached. Could not connect to Kafka.');
            }
        }
    }
}

async function run() {
    try {
        // Start Express server for metrics
        app.get('/metrics', async (req, res) => {
            try {
                res.set('Content-Type', register.contentType);
                res.end(await register.metrics());
            } catch (error) {
                res.status(500).end(error);
            }
        });

        app.get('/health', (req, res) => {
            res.status(200).json({ status: 'ok' });
        });

        app.listen(PORT, () => {
            console.log(`Email service metrics available at http://localhost:${PORT}/metrics`);
        });

        await connectDB();
        
        await initializeTransporter();
        console.log('Email transporter initialized');

        console.log('Waiting 5 seconds for topics to be created...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        await connectWithRetry();

        await consumer.run({
            autoCommit: true,
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    messagesProcessed.inc({ topic, status: 'processing' });

                    const event = JSON.parse(message.value.toString());

                    switch (topic) {
                        case 'user-events':
                            if (event.eventType === 'PASSWORD_CHANGED') {
                                const user = await User.findById(event.userId);
                                if (user) {
                                    await sendEmail(user.email, 'Password Changed',
                                        `Hello ${user.username}, your password was changed successfully. If you did not initiate this change, please contact support immediately.`);
                                    messagesProcessed.inc({ topic, status: 'success' });
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
                                messagesProcessed.inc({ topic, status: 'success' });
                            } else if (event.eventType === 'OFFER_ACCEPTED') {
                                if (initiatingUser) {
                                    await sendEmail(initiatingUser.email, 'Your offer was accepted', `Hello ${initiatingUser.username}, your offer was accepted.`);
                                }
                                if (targetUser) {
                                    await sendEmail(targetUser.email, 'You accepted an offer', `Hello ${targetUser.username}, you accepted an offer.`);
                                }
                                messagesProcessed.inc({ topic, status: 'success' });
                            } else if (event.eventType === 'OFFER_REJECTED') {
                                if (initiatingUser) {
                                    await sendEmail(initiatingUser.email, 'Your offer was rejected', `Hello ${initiatingUser.username}, your offer was rejected.`);
                                }
                                if (targetUser) {
                                    await sendEmail(targetUser.email, 'You rejected an offer', `Hello ${targetUser.username}, you rejected an offer.`);
                                }
                                messagesProcessed.inc({ topic, status: 'success' });
                            }
                            break;
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                    messagesProcessed.inc({ topic: message.topic || 'unknown', status: 'error' });
                }
            }
        });
    } catch (error) {
        console.error('Error initializing email consumer:', error);
    }
};

run().catch(console.error);
