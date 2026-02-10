import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"

interface Product {
  naziv: string;
  slike?: string[];
  slika_url?: string;
  cena: number;
}

interface Variant {
  name: string;
  price: number;
}

interface OrderItem {
  product: Product;
  variant?: Variant;
  size?: string;
  quantity: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { order } = await req.json()
    console.log('1. Order Data:', JSON.stringify(order, null, 2))

    if (!order) {
      throw new Error('Order data is missing')
    }

    // 1. Get Telegram settings
    // Try to fetch from DB first
    const { data: settingsData, error: _settingsError } = await supabaseClient
      .from('admin_settings')
      .select('value')
      .eq('key', 'telegram_chat_id')
      .single()

    let chatId = settingsData?.value

    // Fallback to env var if not in DB
    if (!chatId) {
      chatId = Deno.env.get('TELEGRAM_CHAT_ID')
    }

    if (!chatId) {
      throw new Error('Telegram Chat ID not configured')
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    
    // Log credentials (masked)
    console.log('2. Telegram Credentials Check:', {
        chatId,
        botToken: botToken ? `${botToken.substring(0, 5)}...${botToken.substring(botToken.length - 5)}` : 'undefined'
    })

    if (!botToken) {
      throw new Error('Telegram Bot Token not configured')
    }

    // 2. Format message
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    const itemsList = order.artikli
      .map((item: OrderItem) => {
        const naziv = escapeHtml(item.product.naziv);
        // Support both new 'slike' array and legacy 'slika_url'
        const imageUrl = item.product.slike?.[0] || item.product.slika_url;
        const imageLink = imageUrl ? ` <a href="${imageUrl}">[Slika]</a>` : '';
        
        const variantInfo = item.variant ? item.variant.name : item.size;
        const price = item.variant ? item.variant.price : item.product.cena;
        const formattedPrice = new Intl.NumberFormat("sr-RS").format(price);
        
        return `- ${naziv} - ${variantInfo} (${formattedPrice} RSD) x${item.quantity}${imageLink}`;
      })
      .join('\n')

    // Construct the link to admin panel order (assuming standard structure)
    // You might need to adjust the base URL
    const adminUrl = `${req.headers.get('origin') || 'http://localhost:5173'}/admin/orders`

    const message = `📦 NOVA PORUDŽBINA #${order.order_code || order.id || 'N/A'}
👤 Kupac: ${order.ime_kupca}
📞 Telefon: ${order.telefon_kupca}
📍 Adresa: ${order.adresa_kupca}, ${order.grad_kupca}

🛒 Artikli:
${itemsList}

💰 UKUPNO: ${new Intl.NumberFormat("sr-RS").format(order.ukupna_cena)} RSD

🔗 Pogledaj u Admin Panelu: ${adminUrl}`

    // 3. Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML', // or Markdown if preferred, but plain text is safer for arbitrary input
      }),
    })

    console.log('3. Telegram Fetch Response Status:', response.status, response.statusText)

    const telegramResult = await response.json()
    console.log('4. Telegram Full Response Body:', JSON.stringify(telegramResult, null, 2))

    if (!telegramResult.ok) {
      console.error('Telegram API Error:', telegramResult)
      throw new Error(`Telegram API Error: ${telegramResult.description}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
