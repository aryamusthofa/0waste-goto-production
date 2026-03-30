-- ==========================================
-- DATABASE SETUP 5: CHECKOUT ENGINE
-- Atomic order placement via RPC function
-- Jalankan di Supabase SQL Editor
-- ==========================================

-- 1. Fungsi place_order — atomic: cek stok → insert order → kurangi stok → sold_out jika habis
CREATE OR REPLACE FUNCTION place_order(
  p_customer_id   UUID,
  p_product_id    UUID,
  p_qty           INTEGER,
  p_method        TEXT,
  p_payment       TEXT,
  p_total         DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product_id    UUID;
  v_product_name  TEXT;
  v_current_stock INTEGER;
  v_product_status TEXT;
  v_new_stock     INTEGER;
  v_order_id      UUID;
BEGIN
  -- Lock baris produk agar tidak ada race condition
  SELECT id, name, COALESCE(quantity, stock, 1), status
  INTO v_product_id, v_product_name, v_current_stock, v_product_status
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  -- Cek produk ada
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Produk tidak ditemukan.');
  END IF;

  -- Cek status sold_out
  IF v_product_status = 'sold_out' THEN
    RETURN json_build_object('success', false, 'error', 'Produk sudah habis terjual.');
  END IF;

  -- Cek stok cukup
  IF v_current_stock < p_qty THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Stok tidak cukup. Tersisa ' || v_current_stock || ' item.'
    );
  END IF;

  -- Hitung stok baru
  v_new_stock := v_current_stock - p_qty;

  -- Insert order
  INSERT INTO orders (
    customer_id, product_id, method,
    total_price, payment_method, payment_status, status,
    shipping_fee
  )
  VALUES (
    p_customer_id, p_product_id, p_method,
    p_total, p_payment, 'paid', 'pending',
    CASE WHEN p_method = 'delivery' THEN 5000 ELSE 0 END
  )
  RETURNING id INTO v_order_id;

  -- Update stok + sold_out jika habis
  UPDATE products
  SET
    quantity = v_new_stock,
    stock    = v_new_stock,
    status   = CASE WHEN v_new_stock <= 0 THEN 'sold_out' ELSE status END
  WHERE id = p_product_id;

  RETURN json_build_object(
    'success',   true,
    'order_id',  v_order_id,
    'remaining', v_new_stock
  );
END;
$$;

-- 2. Fungsi cancel_order — kembalikan stok + buka produk jika sold_out
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id  UUID,
  p_user_id   UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_status  TEXT;
  v_product_id    UUID;
BEGIN
  -- Ambil order + validasi pemilik
  SELECT o.status, o.product_id
  INTO v_order_status, v_product_id
  FROM orders o
  WHERE o.id = p_order_id AND o.customer_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Pesanan tidak ditemukan.');
  END IF;

  IF v_order_status <> 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Pesanan tidak bisa dibatalkan (sudah diproses).');
  END IF;

  -- Update status order jadi cancelled
  UPDATE orders SET status = 'cancelled' WHERE id = p_order_id;

  -- Kembalikan stok 1, buka produk jika sold_out
  UPDATE products
  SET
    quantity = COALESCE(quantity, 0) + 1,
    stock    = COALESCE(stock, 0) + 1,
    status   = CASE WHEN status = 'sold_out' THEN 'available' ELSE status END
  WHERE id = v_product_id;

  RETURN json_build_object('success', true);
END;
$$;

-- 3. Grant execute ke authenticated users
GRANT EXECUTE ON FUNCTION place_order TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_order TO authenticated;
