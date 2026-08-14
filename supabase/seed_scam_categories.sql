-- TrulyTrue Seed Script: Trending & Prevalent Scam Categories
-- Copy and paste this into your Supabase SQL Editor to seed public.scam_categories table

CREATE TABLE IF NOT EXISTS public.scam_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.scam_categories (name, description) VALUES
  ('Digital Arrest / Coercion', 'Impersonation of CBI, Police, Customs, TRAI, or Narcotics officers threatening video call arrest.'),
  ('Part-time Job & Task Fraud', 'Fake work-from-home offers demanding YouTube likes, merchant ratings, or prepaid commission tasks.'),
  ('Electricity Bill Disconnection', 'Urgent threats of power or service disconnection unless immediate payment is made to a personal number.'),
  ('FedEx / Customs Courier Scam', 'Calls/SMS claiming an illegal package with drugs or passports was seized in your name.'),
  ('Stock Trading & IPO Fraud', 'WhatsApp groups promising 1000% returns, fake institutional trading apps, or bogus IPO allotments.'),
  ('APK Malware & Trojan Download', 'Malicious Android APK files disguised as banking updates or government scheme apps.'),
  ('Bank Fraud & Spoofed Calls', 'Spoofed helpline numbers, fake fraud alerts, or callers claiming to be bank managers.'),
  ('UPI & Payment Fraud', 'Reverse payment scams, fake payment screenshots, or QR codes sent with claim PIN is needed to receive money.'),
  ('Fake Customer Support', 'Impersonation of Amazon, Flipkart, Swiggy, Airtel, or bank helpline numbers on search engines.'),
  ('Phishing & Credential Theft', 'Fake website portals mimicking banks, tax portals, or streaming services to steal credentials.'),
  ('Loan App Extortion', 'Instant loan apps charging 300% interest, harvesting contacts, and using photo manipulation.'),
  ('Aadhaar, AEPS & KYC Fraud', 'Phishing links or biometric spoofing threatening account/SIM blockage due to pending Aadhaar or PAN KYC.'),
  ('Investment & Crypto Scam', 'Fraudulent crypto presales, fake wallet drainer links, automated trading bots, or forex deposit schemes.'),
  ('Lottery & KBC Reward Scam', 'SMS or letters claiming you won 25 Lakhs in KBC or lucky draw, demanding processing tax upfront.'),
  ('Marketplace & OLX Fraud', 'Fake army/defense personnel or buyers sending QR codes to pay advance token.'),
  ('Romance & Pig Butchering', 'Manipulative online relationships building trust before pitching fake crypto/trading investments.'),
  ('AI Voice Cloning Fraud', 'Cloned voice calls mimicking a family member crying or in emergency demanding immediate bail.'),
  ('Identity Theft & Impersonation', 'Hacked social media accounts asking friends for urgent money or gift cards.'),
  ('Courier Address Update Fraud', 'Fake redelivery notifications demanding address correction fees via suspicious links.'),
  ('Refund & Remote Access Scam', 'Claims of mistaken refunds requiring AnyDesk, TeamViewer, or RustDesk app installation.'),
  ('Social Media & Telegram Spam', 'Automated DM spam, fake giveaways, or account takeover links.'),
  ('Other Emerging Fraud', 'Uncategorized or novel fraudulent tactics.')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;
