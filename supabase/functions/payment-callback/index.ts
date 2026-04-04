import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('Midtrans Callback Received:', body)

    const orderId = body.order_id
    const transactionStatus = body.transaction_status
    const fraudStatus = body.fraud_status

    let newStatus = 'pending'
    let paymentStatus = 'pending'

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        paymentStatus = 'challenge'
      } else if (fraudStatus === 'accept') {
        paymentStatus = 'paid'
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'paid'
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      paymentStatus = 'failed'
      newStatus = 'cancelled'
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'pending'
    }

    // 1. Update status pembayaran di database
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus,
        status: newStatus 
      })
      .eq('id', orderId)

    if (updateError) throw updateError

    // 2. Jika GAGAL, kembalikan stok via RPC cancel_order (Internal)
    // Catatan: Karena kita menggunakan Service Role, kita bisa memanggil fungsi 
    // atau mengupdate langsung. Namun lebih aman menggunakan logika pembatalan terpusat.
    if (newStatus === 'cancelled') {
        // Kita panggil RPC cancel_order untuk kembalikan stok secara aman
        // Namun karena RPC cancel_order mengecek auth.uid(), kita lakukan manual update di sini 
        // karena ini dipanggil oleh sistem (Midtrans), bukan user.
        
        const { data: orderData } = await supabase
            .from('orders')
            .select('product_id, qty')
            .eq('id', orderId)
            .single()

        if (orderData) {
            await supabase.rpc('internal_return_stock', {
                p_product_id: orderData.product_id,
                p_qty: orderData.qty
            })
        }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Callback Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
