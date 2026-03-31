-- ==========================================
-- DATABASE SETUP 5: CHECKOUT ENGINE
-- Atomic order placement via RPC function
-- Jalankan di Supabase SQL Editor
-- ==========================================

-- 1. Fungsi place_order — atomic: cek stok → insert order → kurangi stok → sold_out jika habis
CREATE OR REPLACE FUNCTION place_order(
  p_product_id    UUID,
  p_qty           INTEGER,
  p_method        TEXT,
  p_payment       TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id   UUID;
  v_product_id    UUID;
  v_discount_price DECIMAL;
  v_current_stock INTEGER;
  v_product_status TEXT;
  v_new_stock     INTEGER;
  v_shipping_fee  DECIMAL;
  v_total         DECIMAL;
  v_order_id      UUID;
BEGIN
  v_customer_id := auth.uid();

  IF v_customer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  IF p_qty IS NULL OR p_qty <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Jumlah pembelian tidak valid.');
  END IF;

  IF p_method NOT IN ('pickup', 'delivery') THEN
    RETURN json_build_object('success', false, 'error', 'Metode penerimaan tidak valid.');
  END IF;

  IF p_payment NOT IN ('digital', 'cod') THEN
    RETURN json_build_object('success', false, 'error', 'Metode pembayaran tidak valid.');
  END IF;

  -- Lock baris produk agar tidak ada race condition
  SELECT id, discount_price, COALESCE(quantity, stock, 1), status
  INTO v_product_id, v_discount_price, v_current_stock, v_product_status
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
  v_shipping_fee := CASE WHEN p_method = 'delivery' THEN 5000 ELSE 0 END;
  v_total := (COALESCE(v_discount_price, 0) * p_qty) + v_shipping_fee;

  -- Insert order
  INSERT INTO orders (
    customer_id, product_id, qty, method,
    total_price, payment_method, payment_status, status,
    shipping_fee
  )
  VALUES (
    v_customer_id, p_product_id, p_qty, p_method,
    v_total, p_payment, 'paid', 'pending',
    v_shipping_fee
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
    'remaining', v_new_stock,
    'total',     v_total
  );
END;
$$;

-- 2. Fungsi cancel_order — kembalikan stok + buka produk jika sold_out
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id  UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_order_status  TEXT;
  v_product_id    UUID;
  v_order_qty     INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  -- Ambil order + validasi pemilik
  SELECT o.status, o.product_id, COALESCE(o.qty, 1)
  INTO v_order_status, v_product_id, v_order_qty
  FROM orders o
  WHERE o.id = p_order_id AND o.customer_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Pesanan tidak ditemukan.');
  END IF;

  IF v_order_status <> 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Pesanan tidak bisa dibatalkan (sudah diproses).');
  END IF;

  -- Update status order jadi cancelled
  UPDATE orders SET status = 'cancelled' WHERE id = p_order_id;

  -- Kembalikan stok sesuai qty order, buka produk jika sold_out
  UPDATE products
  SET
    quantity = COALESCE(quantity, 0) + v_order_qty,
    stock    = COALESCE(stock, 0) + v_order_qty,
    status   = CASE WHEN status = 'sold_out' THEN 'available' ELSE status END
  WHERE id = v_product_id;

  RETURN json_build_object('success', true);
END;
$$;

-- 3. Grant execute ke authenticated users
GRANT EXECUTE ON FUNCTION place_order(UUID, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_order(UUID) TO authenticated;
