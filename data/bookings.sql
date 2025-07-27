-- Bookings table
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  vehicle_id uuid references vehicles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending', -- e.g., pending, confirmed, cancelled, completed
  total_price numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Optionally, a payments table for Stripe integration
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  stripe_payment_intent_id text,
  amount numeric(10,2) not null,
  status text not null, -- e.g., succeeded, failed, pending
  created_at timestamp with time zone default timezone('utc', now())
);

-- Optionally, a booking_status lookup table
create table if not exists booking_status (
  status text primary key,
  description text
);

insert into booking_status (status, description) values
  ('pending', 'Awaiting payment or confirmation'),
  ('confirmed', 'Booking confirmed and paid'),
  ('cancelled', 'Booking was cancelled'),
  ('completed', 'Booking completed')
  on conflict (status) do nothing; 