const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = "mongodb+srv://dandaramolad_db_user:bw4x61ZZhq3N7fgi@cluster0.g0wgb82.mongodb.net/?appName=Cluster0"
;

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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.post('/api/applications', async (req, res) => {
  try {
    const { role, fullName, email, phone, portfolio, note, sourcePage } = req.body;

    if (!role || !fullName || !email || !phone || !portfolio) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const application = await Application.create({
      role,
      fullName,
      email,
      phone,
      portfolio,
      note,
      sourcePage,
    });

    return res.status(201).json({
      message: 'Application submitted successfully.',
      id: application._id,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to submit application.' });
  }
});

app.use(express.static(path.join(__dirname)));

app.get('*splat', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const startServer = async () => {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in environment.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
