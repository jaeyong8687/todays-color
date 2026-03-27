#!/bin/bash
# Usage: ./setup-supabase-quick.sh <SUPABASE_URL> <SUPABASE_ANON_KEY>
# Example: ./setup-supabase-quick.sh https://abcdef.supabase.co eyJhbGci...

set -e
URL="$1"
KEY="$2"

if [ -z "$URL" ] || [ -z "$KEY" ]; then
  echo "Usage: $0 <SUPABASE_URL> <SUPABASE_ANON_KEY>"
  echo ""
  echo "Get these from: https://supabase.com/dashboard → Project → Settings → API"
  exit 1
fi

cd "$(dirname "$0")"

echo "$URL" | vercel env add VITE_SUPABASE_URL production --force 2>/dev/null || \
  (vercel env rm VITE_SUPABASE_URL production --yes 2>/dev/null; echo "$URL" | vercel env add VITE_SUPABASE_URL production)

echo "$KEY" | vercel env add VITE_SUPABASE_ANON_KEY production --force 2>/dev/null || \
  (vercel env rm VITE_SUPABASE_ANON_KEY production --yes 2>/dev/null; echo "$KEY" | vercel env add VITE_SUPABASE_ANON_KEY production)

echo "✅ Supabase 연결 완료"
vercel --prod --yes 2>&1 | tail -2
