const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const MOMO_BASE_URL = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';
const MOMO_SUBSCRIPTION_KEY = process.env.MOMO_SUBSCRIPTION_KEY;
const MOMO_API_USER = process.env.MOMO_API_USER; // Collection/Disbursement user id
const MOMO_API_KEY = process.env.MOMO_API_KEY;   // Corresponding API key
const MOMO_COLLECTION_USER = process.env.MOMO_COLLECTION_USER; // Collection user id
const MOMO_COLLECTION_KEY = process.env.MOMO_COLLECTION_KEY; // Collection API key
const MOMO_TARGET_ENV = process.env.MOMO_TARGET_ENV || 'sandbox';
const MOMO_CURRENCY = process.env.MOMO_CURRENCY || 'RWF';

if (!MOMO_SUBSCRIPTION_KEY) {
  console.warn('MOMO_SUBSCRIPTION_KEY not set');
}

async function getAccessToken() {
  const url = `${MOMO_BASE_URL}/disbursement/token/`;
  const basic = Buffer.from(`${MOMO_API_USER}:${MOMO_API_KEY}`).toString('base64');
  const headers = {
    'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
    Authorization: `Basic ${basic}`,
  };
  const { data } = await axios.post(url, null, { headers });
  return data.access_token;
}

async function getCollectionToken() {
  const url = `${MOMO_BASE_URL}/collection/token/`;
  const basic = Buffer.from(`${MOMO_COLLECTION_USER}:${MOMO_COLLECTION_KEY}`).toString('base64');
  const headers = {
    'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
    Authorization: `Basic ${basic}`,
  };
  const { data } = await axios.post(url, null, { headers });
  return data.access_token;
}

async function createTransfer({ amount, phone, externalId, payerMessage, payeeNote, currency = MOMO_CURRENCY }) {
  const token = await getAccessToken();
  const referenceId = uuidv4();
  const url = `${MOMO_BASE_URL}/disbursement/v1_0/transfer`;
  const headers = {
    'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
    Authorization: `Bearer ${token}`,
    'X-Target-Environment': MOMO_TARGET_ENV,
    'X-Reference-Id': referenceId,
    'Content-Type': 'application/json',
  };
  const body = {
    amount: String(amount),
    currency,
    externalId: externalId || referenceId,
    payee: {
      partyIdType: 'MSISDN',
      partyId: String(phone).replace(/[^0-9]/g, ''),
    },
    payerMessage: payerMessage || 'Payroll',
    payeeNote: payeeNote || 'Salary',
  };
  await axios.post(url, body, { headers });
  return referenceId;
}

async function getTransferStatus(referenceId) {
  const token = await getAccessToken();
  const url = `${MOMO_BASE_URL}/disbursement/v1_0/transfer/${referenceId}`;
  const headers = {
    'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
    Authorization: `Bearer ${token}`,
    'X-Target-Environment': MOMO_TARGET_ENV,
  };
  const { data } = await axios.get(url, { headers });
  return data; // contains status, amount, currency, financialTransactionId, etc.
}

async function requestToPay({ amount, phone, externalId, payerMessage, payeeNote, currency = MOMO_CURRENCY }) {
  const token = await getCollectionToken();
  const referenceId = uuidv4();
  const url = `${MOMO_BASE_URL}/collection/v1_0/requesttopay`;
  const headers = {
    'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
    Authorization: `Bearer ${token}`,
    'X-Target-Environment': MOMO_TARGET_ENV,
    'X-Reference-Id': referenceId,
    'Content-Type': 'application/json',
  };
  const body = {
    amount: String(amount),
    currency,
    externalId: externalId || referenceId,
    payer: {
      partyIdType: 'MSISDN',
      partyId: String(phone).replace(/[^0-9]/g, ''),
    },
    payerMessage: payerMessage || 'Payment for order',
    payeeNote: payeeNote || 'Kapee Shop',
  };
  await axios.post(url, body, { headers });
  return referenceId;
}

async function getRequestToPayStatus(referenceId) {
  const token = await getCollectionToken();
  const url = `${MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`;
  const headers = {
    'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
    Authorization: `Bearer ${token}`,
    'X-Target-Environment': MOMO_TARGET_ENV,
  };
  const { data } = await axios.get(url, { headers });
  return data;
}

module.exports = {
  createTransfer,
  getTransferStatus,
  requestToPay,
  getRequestToPayStatus,
};


