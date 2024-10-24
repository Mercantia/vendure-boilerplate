import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    VendureConfig,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import 'dotenv/config';
import path from 'path';
import { MultivendorPlugin } from './plugins/multivendor-plugin/multivendor.plugin';

const IS_DEV = process.env.APP_ENV === 'dev';
const serverPort = 3000;

export const config: VendureConfig = {
    apiOptions: {
        port: serverPort,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        // The following options are useful in development mode,
        // but are best turned off for production for security
        // reasons.
        ...(IS_DEV ? {
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
        // See the README.md "Migrations" section for an explanation of
        // the `synchronize` and `migrations` options.
        synchronize: false,
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
    // When adding or altering custom field definitions, the database will
    // need to be updated. See the "Migrations" section in README.md.
    customFields: {
        Product: [
            { name: 'infoUrl', type: 'string' },  // Product info URL
            { name: 'downloadable', type: 'boolean' },  // Is product downloadable?
            { name: 'ncm', type: 'string' },  // NCM code (Brazilian import/export classification)
            { name: 'gtin', type: 'string' },  // GTIN (Global Trade Item Number)
            { name: 'ean', type: 'string' },  // EAN code (European Article Number)
            { name: 'brand', type: 'string' },  // Brand name
        ],
        Customer: [
            { name: 'socialLoginToken', type: 'string', unique: true },  // Token for social login
            { name: 'cpf', type: 'string', unique: true },  // CPF (Cadastro de Pessoas Físicas)
            { name: 'birthDate', type: 'datetime' },  // Date of birth
        ],
        Seller: [
            { name: 'cnpj', type: 'string', unique: true },  // CNPJ (Cadastro Nacional da Pessoa Jurídica)
            { name: 'companyName', type: 'string' },  // Legal company name
            { name: 'tradingName', type: 'string' },  // Trading name (fantasy name)
            { name: 'stateRegistration', type: 'string' },  // State registration number
            { name: 'municipalRegistration', type: 'string' },  // Municipal registration number
            { name: 'businessPhone', type: 'string' },  // Business phone number
            { name: 'responsiblePerson', type: 'string' },  // Name of the responsible person for the company
        ],
    },
    plugins: [
        MultivendorPlugin.init({
            platformFeeSKU: "Fee",
            platformFeePercent: 3
        }),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            // For local dev, the correct value for assetUrlPrefix should
            // be guessed correctly, but for production it will usually need
            // to be set manually to match your production url.
            assetUrlPrefix: IS_DEV ? undefined : 'https://mercantia.app/assets/',
        }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        EmailPlugin.init({
            devMode: true,
            outputPath: path.join(__dirname, '../static/email/test-emails'),
            route: 'mailbox',
            handlers: defaultEmailHandlers,
            templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
            globalTemplateVars: {
                // The following variables will change depending on your storefront implementation.
                // Here we are assuming a storefront running at http://localhost:8080.
                fromAddress: '"Mercantia" <noreply@mercantia.app>',
                verifyEmailAddressUrl: 'http://localhost:8080/verify',
                passwordResetUrl: 'http://localhost:8080/password-reset',
                changeEmailAddressUrl: 'http://localhost:8080/verify-email-address-change'
            },
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: serverPort + 2,
            adminUiConfig: {
                apiPort: serverPort,
                brand: 'Mercantia',
                hideVendureBranding: true,
                hideVersion: true,
            },
        }),
    ],
};
