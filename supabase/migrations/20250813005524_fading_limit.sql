/*
  # Initial Database Schema for Vena Pictures

  1. New Tables
    - `profiles` - User profile and company settings
    - `users` - Authentication and user management
    - `clients` - Client information and contact details
    - `packages` - Service packages with pricing
    - `add_ons` - Additional services
    - `projects` - Main project management
    - `team_members` - Freelancer/team member information
    - `transactions` - Financial transactions
    - `cards` - Payment cards and accounts
    - `financial_pockets` - Budget allocation pockets
    - `leads` - Prospect management
    - `assets` - Asset management
    - `contracts` - Legal contracts
    - `client_feedback` - Customer satisfaction feedback
    - `social_media_posts` - Social media planning
    - `promo_codes` - Discount codes
    - `sops` - Standard Operating Procedures
    - `notifications` - System notifications
    - `revisions` - Project revision requests
    - `team_project_payments` - Team payment tracking
    - `team_payment_records` - Payment record slips
    - `reward_ledger_entries` - Reward system tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure public access for forms and portals

  3. Features
    - UUID primary keys
    - Timestamps for audit trails
    - JSON fields for complex data
    - Foreign key relationships
    - Proper indexing for performance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (company settings)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  company_name text NOT NULL DEFAULT '',
  website text DEFAULT '',
  address text NOT NULL DEFAULT '',
  bank_account text NOT NULL DEFAULT '',
  authorized_signer text NOT NULL DEFAULT '',
  id_number text DEFAULT '',
  bio text DEFAULT '',
  income_categories jsonb DEFAULT '[]'::jsonb,
  expense_categories jsonb DEFAULT '[]'::jsonb,
  project_types jsonb DEFAULT '[]'::jsonb,
  event_types jsonb DEFAULT '[]'::jsonb,
  asset_categories jsonb DEFAULT '[]'::jsonb,
  sop_categories jsonb DEFAULT '[]'::jsonb,
  project_status_config jsonb DEFAULT '[]'::jsonb,
  notification_settings jsonb DEFAULT '{"newProject": true, "paymentConfirmation": true, "deadlineReminder": true}'::jsonb,
  security_settings jsonb DEFAULT '{"twoFactorEnabled": false}'::jsonb,
  briefing_template text DEFAULT '',
  terms_and_conditions text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table (for app users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'Member' CHECK (role IN ('Admin', 'Member')),
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  instagram text DEFAULT '',
  since date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Prospek', 'Aktif', 'Tidak Aktif', 'Hilang')),
  client_type text NOT NULL DEFAULT 'Langsung' CHECK (client_type IN ('Langsung', 'Vendor')),
  last_contact timestamptz DEFAULT now(),
  portal_access_id uuid DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  physical_items jsonb DEFAULT '[]'::jsonb,
  digital_items jsonb DEFAULT '[]'::jsonb,
  processing_time text NOT NULL DEFAULT '',
  photographers text DEFAULT '',
  videographers text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add-ons table
CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  role text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  standard_fee numeric NOT NULL DEFAULT 0,
  no_rek text DEFAULT '',
  reward_balance numeric NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 5.0 CHECK (rating >= 1 AND rating <= 5),
  performance_notes jsonb DEFAULT '[]'::jsonb,
  portal_access_id uuid DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name text NOT NULL,
  client_name text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  project_type text NOT NULL,
  package_name text NOT NULL,
  package_id uuid REFERENCES packages(id),
  add_ons jsonb DEFAULT '[]'::jsonb,
  date date NOT NULL,
  deadline_date date,
  location text NOT NULL DEFAULT '',
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status text NOT NULL DEFAULT 'Dikonfirmasi',
  active_sub_statuses jsonb DEFAULT '[]'::jsonb,
  total_cost numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'Belum Bayar' CHECK (payment_status IN ('Lunas', 'DP Terbayar', 'Belum Bayar')),
  team jsonb DEFAULT '[]'::jsonb,
  notes text DEFAULT '',
  accommodation text DEFAULT '',
  drive_link text DEFAULT '',
  client_drive_link text DEFAULT '',
  final_drive_link text DEFAULT '',
  start_time text DEFAULT '',
  end_time text DEFAULT '',
  image text DEFAULT '',
  promo_code_id uuid,
  discount_amount numeric DEFAULT 0,
  shipping_details text DEFAULT '',
  dp_proof_url text DEFAULT '',
  printing_details jsonb DEFAULT '[]'::jsonb,
  printing_cost numeric DEFAULT 0,
  transport_cost numeric DEFAULT 0,
  is_editing_confirmed_by_client boolean DEFAULT false,
  is_printing_confirmed_by_client boolean DEFAULT false,
  is_delivery_confirmed_by_client boolean DEFAULT false,
  confirmed_sub_statuses jsonb DEFAULT '[]'::jsonb,
  client_sub_status_notes jsonb DEFAULT '{}'::jsonb,
  sub_status_confirmation_sent_at jsonb DEFAULT '{}'::jsonb,
  completed_digital_items jsonb DEFAULT '[]'::jsonb,
  invoice_signature text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('Pemasukan', 'Pengeluaran')),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  category text NOT NULL,
  method text NOT NULL DEFAULT 'Transfer Bank' CHECK (method IN ('Transfer Bank', 'Tunai', 'E-Wallet', 'Sistem', 'Kartu')),
  pocket_id uuid,
  card_id uuid,
  printing_item_id text DEFAULT '',
  vendor_signature text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_holder_name text NOT NULL,
  bank_name text NOT NULL,
  card_type text NOT NULL DEFAULT 'Debit' CHECK (card_type IN ('Prabayar', 'Kredit', 'Debit')),
  last_four_digits text NOT NULL,
  expiry_date text DEFAULT '',
  balance numeric NOT NULL DEFAULT 0,
  color_gradient text NOT NULL DEFAULT 'from-blue-500 to-sky-400',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Financial pockets table
CREATE TABLE IF NOT EXISTS financial_pockets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'piggy-bank' CHECK (icon IN ('piggy-bank', 'lock', 'users', 'clipboard-list', 'star')),
  type text NOT NULL CHECK (type IN ('Nabung & Bayar', 'Terkunci', 'Bersama', 'Anggaran Pengeluaran', 'Tabungan Hadiah Freelancer')),
  amount numeric NOT NULL DEFAULT 0,
  goal_amount numeric DEFAULT 0,
  lock_end_date date,
  members jsonb DEFAULT '[]'::jsonb,
  source_card_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_channel text NOT NULL CHECK (contact_channel IN ('WhatsApp', 'Instagram', 'Website', 'Telepon', 'Referensi', 'Form Saran', 'Lainnya')),
  location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Sedang Diskusi' CHECK (status IN ('Sedang Diskusi', 'Menunggu Follow Up', 'Dikonversi', 'Ditolak')),
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  purchase_price numeric NOT NULL DEFAULT 0,
  serial_number text DEFAULT '',
  status text NOT NULL DEFAULT 'Tersedia' CHECK (status IN ('Tersedia', 'Digunakan', 'Perbaikan')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_number text NOT NULL UNIQUE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  signing_date date NOT NULL DEFAULT CURRENT_DATE,
  signing_location text NOT NULL DEFAULT '',
  client_name1 text NOT NULL DEFAULT '',
  client_address1 text NOT NULL DEFAULT '',
  client_phone1 text NOT NULL DEFAULT '',
  client_name2 text DEFAULT '',
  client_address2 text DEFAULT '',
  client_phone2 text DEFAULT '',
  shooting_duration text NOT NULL DEFAULT '',
  guaranteed_photos text NOT NULL DEFAULT '',
  album_details text NOT NULL DEFAULT '',
  digital_files_format text NOT NULL DEFAULT 'JPG High-Resolution',
  other_items text DEFAULT '',
  personnel_count text NOT NULL DEFAULT '',
  delivery_timeframe text NOT NULL DEFAULT '30 hari kerja',
  dp_date date,
  final_payment_date date,
  cancellation_policy text NOT NULL DEFAULT '',
  jurisdiction text NOT NULL DEFAULT '',
  vendor_signature text DEFAULT '',
  client_signature text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Client feedback table
CREATE TABLE IF NOT EXISTS client_feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name text NOT NULL,
  satisfaction text NOT NULL CHECK (satisfaction IN ('Sangat Puas', 'Puas', 'Biasa Saja', 'Tidak Puas')),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Social media posts table
CREATE TABLE IF NOT EXISTS social_media_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  post_type text NOT NULL CHECK (post_type IN ('Instagram Feed', 'Instagram Story', 'Instagram Reels', 'TikTok Video', 'Artikel Blog')),
  platform text NOT NULL CHECK (platform IN ('Instagram', 'TikTok', 'Website')),
  scheduled_date date NOT NULL,
  caption text NOT NULL,
  media_url text DEFAULT '',
  status text NOT NULL DEFAULT 'Draf' CHECK (status IN ('Draf', 'Terjadwal', 'Diposting', 'Dibatalkan')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  usage_count integer NOT NULL DEFAULT 0,
  max_usage integer,
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SOPs table
CREATE TABLE IF NOT EXISTS sops (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  category text NOT NULL,
  content text NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  message text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false,
  icon text NOT NULL CHECK (icon IN ('lead', 'deadline', 'revision', 'feedback', 'payment', 'completed', 'comment')),
  link_view text,
  link_action jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Revisions table
CREATE TABLE IF NOT EXISTS revisions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  admin_notes text NOT NULL,
  deadline date NOT NULL,
  freelancer_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Menunggu Revisi' CHECK (status IN ('Menunggu Revisi', 'Sedang Dikerjakan', 'Revisi Selesai')),
  freelancer_notes text DEFAULT '',
  drive_link text DEFAULT '',
  completed_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team project payments table
CREATE TABLE IF NOT EXISTS team_project_payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  team_member_name text NOT NULL,
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Unpaid')),
  fee numeric NOT NULL DEFAULT 0,
  reward numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team payment records table
CREATE TABLE IF NOT EXISTS team_payment_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_number text NOT NULL UNIQUE,
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  project_payment_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric NOT NULL DEFAULT 0,
  vendor_signature text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reward ledger entries table
CREATE TABLE IF NOT EXISTS reward_ledger_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_project_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_ledger_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Authenticated users can manage profiles" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage users" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage packages" ON packages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage add_ons" ON add_ons FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage team_members" ON team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage transactions" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage cards" ON cards FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage financial_pockets" ON financial_pockets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage leads" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage assets" ON assets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage contracts" ON contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage social_media_posts" ON social_media_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage promo_codes" ON promo_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage sops" ON sops FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage notifications" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage revisions" ON revisions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage team_project_payments" ON team_project_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage team_payment_records" ON team_payment_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage reward_ledger_entries" ON reward_ledger_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public access policies for forms and portals
CREATE POLICY "Public can insert client_feedback" ON client_feedback FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can insert leads" ON leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can insert clients" ON clients FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can insert projects" ON projects FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can insert transactions" ON transactions FOR INSERT TO anon WITH CHECK (true);

-- Public read access for portal data
CREATE POLICY "Public can read packages" ON packages FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read add_ons" ON add_ons FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read promo_codes" ON promo_codes FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read profiles" ON profiles FOR SELECT TO anon USING (true);

-- Portal access policies
CREATE POLICY "Public can read client portal data" ON clients FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read project portal data" ON projects FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read team portal data" ON team_members FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read contracts portal data" ON contracts FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read sops portal data" ON sops FOR SELECT TO anon USING (true);
CREATE POLICY "Public can update revisions" ON revisions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public can update projects for confirmations" ON projects FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public can update contracts for signatures" ON contracts FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_portal_access_id ON clients(portal_access_id);
CREATE INDEX IF NOT EXISTS idx_team_members_portal_access_id ON team_members(portal_access_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(date);
CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_revisions_project_id ON revisions(project_id);
CREATE INDEX IF NOT EXISTS idx_revisions_freelancer_id ON revisions(freelancer_id);

-- Insert default admin user
INSERT INTO users (id, email, password_hash, full_name, role, permissions) 
VALUES (
  uuid_generate_v4(),
  'admin@venapictures.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'password123'
  'Administrator',
  'Admin',
  '[]'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Insert default profile
INSERT INTO profiles (
  id,
  user_id,
  full_name,
  email,
  phone,
  company_name,
  website,
  address,
  bank_account,
  authorized_signer,
  bio,
  income_categories,
  expense_categories,
  project_types,
  event_types,
  asset_categories,
  sop_categories,
  project_status_config,
  briefing_template
) VALUES (
  uuid_generate_v4(),
  (SELECT id FROM auth.users LIMIT 1),
  'Vena Pictures',
  'admin@venapictures.com',
  '+62812345678',
  'Vena Pictures',
  'https://venapictures.com',
  'Jakarta, Indonesia',
  'BCA 1234567890 a.n. Vena Pictures',
  'Vena Pictures',
  'Vendor fotografi dan videografi profesional untuk berbagai acara spesial Anda.',
  '["DP Proyek", "Pelunasan Proyek", "Penjualan Aset", "Lainnya"]'::jsonb,
  '["Gaji Freelancer", "Transportasi", "Peralatan", "Marketing", "Operasional", "Lainnya"]'::jsonb,
  '["Pernikahan", "Prewedding", "Engagement", "Birthday Party", "Corporate Event", "Graduation", "Lainnya"]'::jsonb,
  '["Meeting Klien", "Survey Lokasi", "Libur", "Workshop", "Lainnya"]'::jsonb,
  '["Kamera", "Lensa", "Lighting", "Audio", "Aksesoris", "Komputer", "Software", "Lainnya"]'::jsonb,
  '["Fotografi", "Videografi", "Editing", "Administrasi", "Marketing", "Umum"]'::jsonb,
  '[
    {"id": "status_1", "name": "Dikonfirmasi", "color": "#3b82f6", "note": "Proyek telah dikonfirmasi oleh klien", "subStatuses": []},
    {"id": "status_2", "name": "Briefing", "color": "#8b5cf6", "note": "Tahap briefing dengan klien", "subStatuses": [{"name": "Briefing Awal", "note": "Diskusi konsep dan ekspektasi"}, {"name": "Moodboard", "note": "Pembuatan referensi visual"}]},
    {"id": "status_3", "name": "Persiapan", "color": "#f97316", "note": "Persiapan tim dan peralatan", "subStatuses": [{"name": "Assign Tim", "note": "Penugasan fotografer dan videografer"}, {"name": "Cek Peralatan", "note": "Pemeriksaan kamera dan equipment"}]},
    {"id": "status_4", "name": "Pelaksanaan", "color": "#06b6d4", "note": "Hari pelaksanaan acara", "subStatuses": []},
    {"id": "status_5", "name": "Editing", "color": "#eab308", "note": "Proses editing foto dan video", "subStatuses": [{"name": "Seleksi Foto", "note": "Pemilihan foto terbaik"}, {"name": "Editing Foto", "note": "Retouching dan color grading"}, {"name": "Editing Video", "note": "Video editing dan post-production"}]},
    {"id": "status_6", "name": "Review Klien", "color": "#6366f1", "note": "Klien melakukan review hasil", "subStatuses": []},
    {"id": "status_7", "name": "Printing", "color": "#ec4899", "note": "Proses cetak album dan foto", "subStatuses": [{"name": "Desain Album", "note": "Layout dan desain album"}, {"name": "Proses Cetak", "note": "Pencetakan fisik album"}]},
    {"id": "status_8", "name": "Dikirim", "color": "#10b981", "note": "Pengiriman hasil ke klien", "subStatuses": []},
    {"id": "status_9", "name": "Selesai", "color": "#10b981", "note": "Proyek telah selesai", "subStatuses": []},
    {"id": "status_10", "name": "Dibatalkan", "color": "#ef4444", "note": "Proyek dibatalkan", "subStatuses": []}
  ]'::jsonb,
  'Halo tim! 📸\n\nProyek baru telah ditugaskan kepada Anda:\n\n📅 Tanggal: [DATE]\n📍 Lokasi: [LOCATION]\n👥 Klien: [CLIENT]\n📝 Jenis: [TYPE]\n\nSilakan cek detail lengkap di portal freelancer Anda.\n\nTerima kasih!'
) ON CONFLICT DO NOTHING;