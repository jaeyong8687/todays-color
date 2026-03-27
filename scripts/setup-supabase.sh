#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Supabase 클라우드 동기화 설정 (Today's Color)          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "이 스크립트는 Supabase 클라우드 동기화를 Vercel에 연결합니다."
echo "로컬 브라우저의 색상 기록을 클라우드에 저장하고 어디서든 접근할 수 있게 됩니다."
echo ""
echo "────────────────────────────────────────────────────────────────"
echo " 시작 전 준비사항:"
echo "  1. https://supabase.com 에서 새 프로젝트 생성 (또는 기존 프로젝트 사용)"
echo "  2. Project Settings → API 에서 다음 정보를 복사하세요:"
echo "     - Project URL (https://xxxxxxxxxxxx.supabase.co)"
echo "     - anon public key"
echo ""
echo " Supabase DB 스키마 적용 방법:"
echo "  1. Supabase Dashboard → SQL Editor 접속"
echo "  2. 아래 파일 내용 전체 복사 후 실행:"
echo "     $(pwd)/supabase-schema.sql"
echo "────────────────────────────────────────────────────────────────"
echo ""
read -p "Supabase Project URL을 입력하세요 (예: https://abc123.supabase.co): " SUPABASE_URL

if [ -z "$SUPABASE_URL" ]; then
  echo "❌ URL이 입력되지 않았습니다."
  exit 1
fi

read -p "Supabase anon public key를 입력하세요: " -s SUPABASE_ANON_KEY
echo ""

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ anon key가 입력되지 않았습니다."
  exit 1
fi

echo ""
echo "Vercel에 환경변수를 추가하는 중..."

echo "$SUPABASE_URL" | vercel env add VITE_SUPABASE_URL production 2>/dev/null \
  && echo "✅ VITE_SUPABASE_URL 설정 완료" \
  || echo "⚠️  이미 존재하거나 오류 발생 (vercel env rm VITE_SUPABASE_URL 후 재시도)"

echo "$SUPABASE_ANON_KEY" | vercel env add VITE_SUPABASE_ANON_KEY production 2>/dev/null \
  && echo "✅ VITE_SUPABASE_ANON_KEY 설정 완료" \
  || echo "⚠️  이미 존재하거나 오류 발생"

echo ""
echo "Vercel 재배포 중..."
vercel --prod --yes 2>&1 | tail -3

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    설정 완료! ✅                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "이제 https://todays-color.vercel.app 에서:"
echo "  ✅ 카카오 로그인 가능"
echo "  ✅ 색상 기록이 Supabase 클라우드에 자동 저장"
echo "  ✅ 모든 기기에서 데이터 동기화"
echo ""
echo "로컬 데이터 이전:"
echo "  앱에서 카카오 로그인 후 기존 로컬 데이터가 자동으로 클라우드에 마이그레이션됩니다."
