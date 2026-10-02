const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tenders';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Tender Schema & Model
const tenderSchema = new mongoose.Schema({
  tenderNumber: String,
  month: String,
  tenderType: String,
  otherTenderType: String,
  bidOfferValidity: String,
  location: String,
  branch: String,
  itemCategory: String,
  contractPeriod: String,
  minAnnualTurnover: String,
  experienceRequired: String,
  docsRequired: String,
  bidType: String,
  emdRequired: String,
  tenderRemarks: String,
  customerName: String,
  contactName: String,
  mobileNumber: String,
  emailId: String,
  tenderWebLink: String,
  tenderName: String,
  tenderPublishDate: Date,
  tenderValue: Number,
  tenderLastDate: Date,
  tenderDocument: String,
  boqDocument: String,
  annexure1: String,
  annexure2: String,
  annexure3: String,
  subTenderDocument: String,
  subEmdDocument: String,
  subBgDocument: String,
  subOtherDocuments: String,
  emdValue: Number,
  emdDetails: String,
  bgValue: String, // Yes/No
  bgNumber: String,
  bgBankName: String,
  bgBranch: String,
  bgValidFrom: Date,
  bgValidEnd: Date,
  tenderDescription: String,
  zone: String,
  branchManager: String,
  tenderSubmissionDate: Date,
  tenderQuoteValue: Number,
  quoteValidUpto: Date,
  tenderStatus: { type: String, default: 'Pending' },
  poNumber: String,
  poDate: Date,
  orderValue: Number,
  contractValidFrom: Date,
  contractValidEnd: Date,
  remarks: String,
  tenderDoc: String,
  emdDoc: String,
  bgDoc: String,
  otherDoc: String
}, { timestamps: true });

const Tender = mongoose.model('Tender', tenderSchema);

// User Schema & Model (For Login)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  organization: String
});

const User = mongoose.model('User', userSchema);

// Seed user if not exists
const seedUser = async () => {
  const existingUser = await User.findOne({ username: 'malladi.mohana.murali.krishna' });
  if (!existingUser) {
    const newUser = new User({
      username: 'malladi.mohana.murali.krishna',
      password: 'Welcome@123',
      organization: 'ssspl enterprise realm'
    });
    await newUser.save();
    console.log('Seed user created.');
  }
};
seedUser();

// Routes
app.post('/api/login', async (req, res) => {
  const { username, password, organization } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    res.json({ success: true, message: 'Login successful', token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/tenders', async (req, res) => {
  const tenders = await Tender.find().sort({ createdAt: -1 });
  res.json(tenders);
});

app.post('/api/tenders', async (req, res) => {
  const newTender = new Tender(req.body);
  await newTender.save();
  res.json(newTender);
});

app.put('/api/tenders/:id', async (req, res) => {
  const updated = await Tender.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/api/tenders/:id', async (req, res) => {
  await Tender.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
