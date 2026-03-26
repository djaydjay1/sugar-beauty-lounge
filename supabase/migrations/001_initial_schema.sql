-- Sugar Beauty Lounge — Full Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- LOCATIONS
-- ============================================================
create table locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text not null,
  phone text,
  open_time time not null default '09:00',
  close_time time not null default '22:00',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into locations (name, address, phone) values
  ('Mall of the Emirates', 'Sheikh Zayed Road, Dubai', '+971 4 452 0989'),
  ('Dubai Sports City', 'European Building, Canal Residence West, Dubai', '+971 4 452 0989'),
  ('Bawabat AlSharq Mall', 'Abu Dhabi', null),
  ('HQ', 'Rania Business Center, Dubai', '+971 4 452 0989');

-- ============================================================
-- SERVICES
-- ============================================================
create table service_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  name_ar text,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table services (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references service_categories(id),
  name text not null,
  name_ar text,
  description text,
  duration_minutes int not null default 60,
  price numeric(10,2) not null,
  price_from boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Seed categories
insert into service_categories (name, name_ar, sort_order) values
  ('Hair', 'شعر', 1),
  ('Nails', 'أظافر', 2),
  ('Skin & Facials', 'البشرة والوجه', 3),
  ('Waxing & Threading', 'إزالة الشعر', 4),
  ('Lashes & Brows', 'رموش وحواجب', 5),
  ('Makeup', 'مكياج', 6);

-- ============================================================
-- CLIENTS (CRM)
-- ============================================================
create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  whatsapp text,
  email text,
  nationality text,
  language_preference text not null default 'en' check (language_preference in ('en', 'ar')),
  notes text,
  referral_source text,
  loyalty_points int not null default 0,
  total_spent numeric(12,2) not null default 0,
  visit_count int not null default 0,
  last_visit_at timestamptz,
  created_at timestamptz not null default now()
);
create index on clients (phone);
create index on clients (whatsapp);
create index on clients (email);

create table client_preferences (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  service_id uuid references services(id),
  staff_id uuid,  -- FK added after staff table
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- STAFF & HR
-- ============================================================
create table staff (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  phone text,
  email text,
  nationality text,
  emirates_id text,
  visa_expiry date,
  passport_expiry date,
  hire_date date not null,
  base_salary numeric(10,2) not null default 0,
  commission_rate numeric(5,4) not null default 0,  -- e.g. 0.10 = 10%
  location_id uuid references locations(id),
  is_active boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Now add the FK we deferred
alter table client_preferences add constraint fk_staff foreign key (staff_id) references staff(id);

create table staff_services (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid not null references staff(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  unique(staff_id, service_id)
);

create table shifts (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid not null references staff(id) on delete cascade,
  location_id uuid not null references locations(id),
  date date not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);
create index on shifts (staff_id, date);

create table leave_requests (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid not null references staff(id) on delete cascade,
  type text not null check (type in ('annual','sick','unpaid','public_holiday')),
  start_date date not null,
  end_date date not null,
  days int not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  approved_by uuid references staff(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id),
  staff_id uuid not null references staff(id),
  service_id uuid not null references services(id),
  location_id uuid not null references locations(id),
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending','confirmed','in_progress','completed','cancelled','no_show')),
  source text not null default 'website' check (source in ('website','whatsapp','phone','walk_in','instagram')),
  notes text,
  reminder_sent boolean not null default false,
  review_requested boolean not null default false,
  created_at timestamptz not null default now()
);
create index on appointments (date, location_id);
create index on appointments (client_id);
create index on appointments (staff_id, date);

-- ============================================================
-- FINANCE
-- ============================================================
create table invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text not null unique,
  client_id uuid not null references clients(id),
  appointment_id uuid references appointments(id),
  subtotal numeric(12,2) not null,
  vat_amount numeric(12,2) not null default 0,  -- 5% UAE VAT
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue','cancelled')),
  payment_method text check (payment_method in ('cash','card','bank_transfer','stripe')),
  stripe_payment_intent text,
  notes text,
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index on invoices (client_id);
create index on invoices (status);

create table invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity int not null default 1,
  unit_price numeric(12,2) not null,
  total numeric(12,2) not null
);

-- Auto-increment invoice number
create sequence invoice_number_seq start 1001;

create or replace function generate_invoice_number()
returns trigger language plpgsql as $$
begin
  if new.invoice_number is null or new.invoice_number = '' then
    new.invoice_number := 'SBL-' || lpad(nextval('invoice_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger set_invoice_number
  before insert on invoices
  for each row execute function generate_invoice_number();

create table expenses (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  description text not null,
  amount numeric(12,2) not null,
  date date not null,
  receipt_url text,
  staff_id uuid references staff(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- INVENTORY
-- ============================================================
create table inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  brand text,
  unit text not null default 'unit',
  current_stock numeric(12,2) not null default 0,
  reorder_level numeric(12,2) not null default 5,
  cost_per_unit numeric(12,2) not null default 0,
  supplier text,
  location_id uuid references locations(id),
  created_at timestamptz not null default now()
);

create table inventory_transactions (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references inventory_items(id),
  type text not null check (type in ('in','out','adjustment')),
  quantity numeric(12,2) not null,
  notes text,
  staff_id uuid references staff(id),
  created_at timestamptz not null default now()
);

-- Auto-update stock level on transaction
create or replace function update_inventory_stock()
returns trigger language plpgsql as $$
begin
  if new.type = 'in' then
    update inventory_items set current_stock = current_stock + new.quantity where id = new.item_id;
  elsif new.type = 'out' then
    update inventory_items set current_stock = current_stock - new.quantity where id = new.item_id;
  elsif new.type = 'adjustment' then
    update inventory_items set current_stock = new.quantity where id = new.item_id;
  end if;
  return new;
end;
$$;

create trigger on_inventory_transaction
  after insert on inventory_transactions
  for each row execute function update_inventory_stock();

-- ============================================================
-- MARKETING
-- ============================================================
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  appointment_id uuid references appointments(id),
  platform text not null default 'internal' check (platform in ('google','internal','instagram')),
  rating int not null check (rating between 1 and 5),
  comment text,
  reply text,
  created_at timestamptz not null default now()
);

create table social_posts (
  id uuid primary key default uuid_generate_v4(),
  platform text not null check (platform in ('instagram','tiktok','facebook')),
  caption text not null,
  caption_ar text,
  image_urls text[] not null default '{}',
  scheduled_at timestamptz,
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft','scheduled','published')),
  created_at timestamptz not null default now()
);

create table promotions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value numeric(10,2) not null,
  code text unique,
  valid_from date not null,
  valid_until date not null,
  usage_count int not null default 0,
  max_uses int,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- WAITLIST
-- ============================================================
create table waitlist (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id),
  service_id uuid not null references services(id),
  staff_id uuid references staff(id),
  preferred_date date not null,
  preferred_time time,
  notified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- WHATSAPP AI CONVERSATIONS
-- ============================================================
create table whatsapp_conversations (
  id uuid primary key default uuid_generate_v4(),
  phone text not null unique,
  client_id uuid references clients(id),
  messages jsonb not null default '[]',
  last_message_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','resolved','escalated')),
  created_at timestamptz not null default now()
);
create index on whatsapp_conversations (phone);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table locations enable row level security;
alter table service_categories enable row level security;
alter table services enable row level security;
alter table clients enable row level security;
alter table client_preferences enable row level security;
alter table staff enable row level security;
alter table staff_services enable row level security;
alter table shifts enable row level security;
alter table leave_requests enable row level security;
alter table appointments enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table expenses enable row level security;
alter table inventory_items enable row level security;
alter table inventory_transactions enable row level security;
alter table reviews enable row level security;
alter table social_posts enable row level security;
alter table promotions enable row level security;
alter table waitlist enable row level security;
alter table whatsapp_conversations enable row level security;

-- Public read for booking flow (services, locations, staff)
create policy "Public can read active services" on services for select using (is_active = true);
create policy "Public can read categories" on service_categories for select using (true);
create policy "Public can read active locations" on locations for select using (is_active = true);
create policy "Public can read active staff" on staff for select using (is_active = true);

-- Public insert for bookings & reviews
create policy "Public can create appointments" on appointments for insert with check (true);
create policy "Public can create reviews" on reviews for insert with check (true);
create policy "Public can create clients" on clients for insert with check (true);
create policy "Public can create waitlist" on waitlist for insert with check (true);

-- WhatsApp webhook can upsert conversations
create policy "Service can manage conversations" on whatsapp_conversations for all using (true);

-- Anon read for public-facing data
create policy "Public can read promotions" on promotions for select using (is_active = true);
