import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MIDTRANS_SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY')
const IS_PRODUCTION = Deno.env.get('MIDTRANS_MODE') === 'production'
const MIDTRANS_URL = IS_PRODUCTION 
  ? 'https://app.midtrans.com/snap/v1/transactions' 
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, gross_amount, customer_details } = await req.json()

    const authString = btoa(`${MIDTRANS_SERVER_KEY}:`)
    
    const payload = {
      transaction_details: {
        order_id: order_id,
        gross_amount: gross_amount,
      },
      customer_details: customer_details,
      usage_limit: 1
    }

    const response = await fetch(MIDTRANS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
