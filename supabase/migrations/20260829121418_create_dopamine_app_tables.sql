/*
# Create tables for Dopamine Delivery app

## Overview
This migration creates the database schema for a Korean-styled fake food delivery app
targeted at Swedish users. The app lets users browse restaurants, add items to a cart,
"go through" a fake checkout, watch a delivery tracker, and then discover the food
was never real — they saved the money instead. The app tracks total "saved" money
per anonymous user (no sign-in required).

## New Tables

### `sessions`
- `id` (uuid, primary key) — anonymous session identifier
- `total_saved` (numeric, default 0) — cumulative fake money "saved" across all fake orders
- `orders_count` (integer, default 0) — number of fake orders placed
- `created_at` (timestamptz)

### `fake_orders`
- `id` (uuid, primary key)
- `session_id` (uuid, references sessions) — which anonymous session placed this fake order
- `restaurant_name` (text) — name of the restaurant
- `items` (jsonb) — array of ordered items with name, price, quantity
- `subtotal` (numeric) — subtotal of the order
- `delivery_fee` (numeric) — delivery fee
- `total` (numeric) — total amount
- `saved` (boolean, default true) — always true; the money is "saved" because the order was never real
- `created_at` (timestamptz)

## Security
- RLS enabled on both tables.
- Single-tenant, no-auth app: policies allow `anon, authenticated` to CRUD their own
  session data. Since there is no sign-in, all data is intentionally accessible via
  the anon key.
*/

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_saved numeric(10, 2) NOT NULL DEFAULT 0,
  orders_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
CREATE POLICY "anon_select_sessions" ON sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
CREATE POLICY "anon_insert_sessions" ON sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;
CREATE POLICY "anon_update_sessions" ON sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON sessions;
CREATE POLICY "anon_delete_sessions" ON sessions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS fake_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  restaurant_name text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10, 2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10, 2) NOT NULL DEFAULT 0,
  total numeric(10, 2) NOT NULL DEFAULT 0,
  saved boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fake_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_fake_orders" ON fake_orders;
CREATE POLICY "anon_select_fake_orders" ON fake_orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_fake_orders" ON fake_orders;
CREATE POLICY "anon_insert_fake_orders" ON fake_orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_fake_orders" ON fake_orders;
CREATE POLICY "anon_update_fake_orders" ON fake_orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_fake_orders" ON fake_orders;
CREATE POLICY "anon_delete_fake_orders" ON fake_orders FOR DELETE
  TO anon, authenticated USING (true);
