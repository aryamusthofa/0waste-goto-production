# eco-chat Edge Function

Gemini proxy for 0Waste EcoChat.

## Why

Frontend must not store Gemini API keys. This function keeps key server-side.

## Deploy

1. Login and link project:
   - `supabase login`
   - `supabase link --project-ref <your-project-ref>`
2. Set secret:
   - `supabase secrets set GEMINI_API_KEY=your_key_here`
3. Deploy:
   - `supabase functions deploy eco-chat`

## Request body

```json
{
  "messages": [
    { "role": "user", "content": "Apa itu anti-basi?" }
  ],
  "provider": "gemini"
}
```

## Response body

```json
{
  "reply": "Anti-Basi adalah ..."
}
```
