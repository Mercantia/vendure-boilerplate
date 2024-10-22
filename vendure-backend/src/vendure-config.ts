import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    VendureConfig,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, EmailPluginDevModeOptions, EmailPluginOptions } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { StripePlugin } from '@vendure/payments-plugin/package/stripe';
import { MultivendorPlugin } from './plugins/multivendor-plugin/multivendor.plugin';
import 'dotenv/config';
import path from 'path';
import { Express } from 'express'; // For custom middleware

const isDev: Boolean = process.env.APP_ENV === 'dev';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class SendgridEmailSender {
    async send(email: any) {
        await sgMail.send({
            to: email.recipient,
            from: email.from,
            subject: email.subject,
            html: email.body
        });
    }
}

const emailPluginOptions = isDev || !process.env.SENDGRID_API_KEY ? {
    devMode: true,
    outputPath: path.join(__dirname, '../static/email/test-emails'),
    route: 'mailbox'
} : {
    emailSender: new SendgridEmailSender(),
    transport: {
        type: 'sendgrid',
        apiKey: process.env.SENDGRID_API_KEY
    }
};

export const config: VendureConfig = {
    apiOptions: {
        // Hostnames for different services
        hostname: process.env.PUBLIC_DOMAIN || 'mercantia.app',
        port: +(process.env.PORT || 3000),
        
        // Admin API should be served from api.mercantia.app
        adminApiPath: 'admin-api',
        adminApiHostname: 'api.mercantia.app', // Admin API domain

        // Shop API should be served from shop.mercantia.app
        shopApiPath: 'shop-api',
        shopApiHostname: 'shop.mercantia.app', // Shop API domain

        // Development mode options
        ...(isDev ? {
            adminApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            adminApiDebug: true,
            shopApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            shopApiDebug: true,
        } : {}),
    },
    authOptions: {
        requireVerification: false,
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME,
            password: process.env.SUPERADMIN_PASSWORD,
        },
        cookieOptions: {
            secret: process.env.COOKIE_SECRET,
        },
    },
    dbConnectionOptions: {
        type: 'postgres',
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        database: process.env.DB_NAME,
        schema: process.env.DB_SCHEMA,
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    customFields: {
        Product: [
            { name: 'infoUrl', type: 'string' },
            { name: 'downloadable', type: 'boolean' },
            { name: 'shortName', type: 'localeString' },
            { name: 'ncm', type: 'string' },
            { name: 'gtin', type: 'string' },
            { name: 'ean', type: 'string' },
            { name: 'brand', type: 'string' },
        ],
        User: [
            { name: 'socialLoginToken', type: 'string', unique: true },
            { name: 'cpf', type: 'string', unique: true },
            { name: 'birthDate', type: 'datetime' },
            { name: 'phoneNumber', type: 'string' },
        ],
        Seller: [
            { name: 'cnpj', type: 'string', unique: true },
            { name: 'companyName', type: 'string' },
            { name: 'tradingName', type: 'string' },
            { name: 'stateRegistration', type: 'string' },
            { name: 'municipalRegistration', type: 'string' },
            { name: 'businessPhone', type: 'string' },
            { name: 'responsiblePerson', type: 'string' },
        ],
    },
    plugins: [
        MultivendorPlugin.init({
            platformFeePercent: 3,
            platformFeeSKU: 'FEE',
        }),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: process.env.ASSET_VOLUME_PATH || path.join(__dirname, '../static/assets'),
            assetUrlPrefix: isDev ? undefined : `https://${process.env.PUBLIC_DOMAIN}/assets/`,
        }),
        StripePlugin.init({
            storeCustomersInStripe: true,
            paymentIntentCreateParams: (injector, ctx, order) => {
                return {
                    description: `Order #${order.code} for ${order.customer?.emailAddress}`
                };
            }
        }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        EmailPlugin.init({
            ...emailPluginOptions,
            handlers: defaultEmailHandlers,
            templatePath: path.join(__dirname, '../static/email/templates'),
            globalTemplateVars: {
                fromAddress: process.env.EMAIL_FROM_ADDRESS || '"example" <noreply@example.com>',
                verifyEmailAddressUrl: `${process.env.STOREFRONT_URL}/verify`,
                passwordResetUrl: `${process.env.STOREFRONT_URL}/password-reset`,
                changeEmailAddressUrl: `${process.env.STOREFRONT_URL}/verify-email-address-change`
            },
        } as EmailPluginOptions | EmailPluginDevModeOptions),
        AdminUiPlugin.init({
            route: 'admin', // Admin UI served at the root path
            port: 3002,
            adminUiConfig: {
                apiHost: isDev ? `http://${process.env.PUBLIC_DOMAIN}` : `https://${process.env.PUBLIC_DOMAIN}`,
                brand: 'Mercantia',
                hideVendureBranding: true,
                hideVersion: true,
            },
        }),
    ],
    // Middleware to redirect `/` to `admin.mercantia.app`
    // middleware: [
    //     {
    //         handler: (req: any, res: any, next: any) => {
    //             if (req.hostname === 'mercantia.app' && req.path === '/') {
    //                 res.redirect(301, 'https://admin.mercantia.app/admin');
    //             } else {
    //                 next();
    //             }
    //         },
    //         route: '/',
    //     },
    // ],
};
