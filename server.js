const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com';
const ZOHO_API_DOMAIN = process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com';
const ZOHO_MODULE = process.env.ZOHO_MODULE || 'Leads';
const APPLICANT_COMPANY = process.env.APPLICANT_COMPANY || 'GText Careers';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const applicationSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    portfolio: { type: String, required: true, trim: true },
    note: { type: String, trim: true, default: '' },
    sourcePage: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const Application = mongoose.model('Application', applicationSchema);
let isMongoConnected = false;
let zohoAccessToken = '';
let zohoAccessTokenExpiry = 0;

const normalizeFullName = (fullName) => {
  const clean = (fullName || '').trim().replace(/\s+/g, ' ');
  if (!clean) return { firstName: 'Applicant', lastName: 'Unknown' };
  const parts = clean.split(' ');
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
};

const getZohoAccessToken = async () => {
  const now = Date.now();
  if (zohoAccessToken && now < zohoAccessTokenExpiry) return zohoAccessToken;

  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    throw new Error('Zoho credentials are not fully configured.');
  }

  const tokenUrl = `${ZOHO_ACCOUNTS_URL}/oauth/v2/token`;
  const params = new URLSearchParams({
    refresh_token: ZOHO_REFRESH_TOKEN,
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error || 'Failed to refresh Zoho access token.');
  }

  zohoAccessToken = data.access_token;
  const expiresInMs = Number(data.expires_in || 3600) * 1000;
  zohoAccessTokenExpiry = Date.now() + expiresInMs - 60000;
  return zohoAccessToken;
};

const sendToZohoCRM = async ({ role, fullName, email, phone, portfolio, note, sourcePage }) => {
  const token = await getZohoAccessToken();
  const { firstName, lastName } = normalizeFullName(fullName);

  const zohoPayload = {
    data: [
      {
        First_Name: firstName,
        Last_Name: lastName,
        Email: email,
        Phone: phone,
        Designation: role,
        Website: portfolio,
        Lead_Source: sourcePage || 'Website',
        Company: APPLICANT_COMPANY,
        Description: note || '',
      },
    ],
    trigger: ['workflow'],
  };

  const response = await fetch(`${ZOHO_API_DOMAIN}/crm/v2/${ZOHO_MODULE}`, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(zohoPayload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Zoho CRM insert failed.');
  }
  return data;
};

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1,
    zohoConfigured: Boolean(ZOHO_CLIENT_ID && ZOHO_CLIENT_SECRET && ZOHO_REFRESH_TOKEN),
  });
});

app.post('/api/applications', async (req, res) => {
  try {
    const { role, fullName, email, phone, portfolio, note, sourcePage } = req.body;

    if (!role || !fullName || !email || !phone || !portfolio) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    let mongoId = null;
    if (isMongoConnected) {
      const application = await Application.create({
        role,
        fullName,
        email,
        phone,
        portfolio,
        note,
        sourcePage,
      });
      mongoId = application._id;
    }

    await sendToZohoCRM({ role, fullName, email, phone, portfolio, note, sourcePage });

    return res.status(201).json({
      message: 'Application submitted successfully.',
      id: mongoId,
      sentToZoho: true,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to submit application.' });
  }
});

app.use(express.static(path.join(__dirname)));

app.get('*splat', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const startServer = async () => {
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      isMongoConnected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.warn('MongoDB connection failed, continuing without DB:', error.message);
      isMongoConnected = false;
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
