// scripts/generate-and-upload-images.mts
// 실행: npx tsx scripts/generate-and-upload-images.mts

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
dotenv.config({ path: '.env.local' })

// ─────────────────────────────────────────────
// 환경변수
// ─────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ .env.local에 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 확인')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'product-images'
const OUTPUT_DIR = path.join(process.cwd(), 'tmp-product-images')
const WIDTH = 800
const HEIGHT = 600

// ─────────────────────────────────────────────
// 제품별 디자인 정의
// ─────────────────────────────────────────────
interface ProductDesign {
  slug: string
  gradientStart: string
  gradientEnd: string
  icon: string        // SVG path (Lucide MIT 라이선스)
  iconViewBox: string
  title: string
  subtitle: string
}

// Lucide 아이콘 path 데이터 (MIT License - https://lucide.dev)
const ICON_PATHS = {
  // Monitor (모니터)
  monitor: 'M2 3h20v14H2V3zm2 2v10h16V5H4zm-1 14h18v2H3v-2z',
  // Shield Check (방패 체크)
  shieldCheck: 'M12 2l8 4v6c0 5.25-3.5 10-8 11.25C7.5 22 4 17.25 4 12V6l8-4zm0 2.18L6 7.38V12c0 4.13 2.72 7.86 6 9.14 3.28-1.28 6-5.01 6-9.14V7.38L12 4.18zm-1 8.32l-2.5-2.5 1.41-1.41L11 9.68l3.59-3.59 1.41 1.41L11 12.5z',
  // Laptop (노트북)
  laptop: 'M3 6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm2 0v8h14V6H5zM1 18h22v1a1 1 0 01-1 1H2a1 1 0 01-1-1v-1z',
  // Home (집)
  home: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10',
  // FileText (문서)
  fileText: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-2 1.5L17.5 9H12V3.5zM8 13h8v2H8v-2zm0 4h8v2H8v-2zm0-8h3v2H8V9z',
  // Star (별)
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  // Cloud (클라우드)
  cloud: 'M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z',
  // CheckCircle (체크 원)
  checkCircle: 'M12 2a10 10 0 1010 10A10 10 0 0012 2zm-1 14.5l-4-4 1.41-1.41L11 13.67l5.59-5.58L18 9.5l-7 7z',
  // Layers (레이어)
  layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  // Zap (번개)
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
}

const products: ProductDesign[] = [
  {
    slug: 'windows-11-pro',
    gradientStart: '#0078D4',
    gradientEnd: '#00BCF2',
    icon: ICON_PATHS.monitor,
    iconViewBox: '0 0 24 24',
    title: 'Windows 11 Pro',
    subtitle: '영구 디지털 라이선스',
  },
  {
    slug: 'windows-11-home',
    gradientStart: '#0078D4',
    gradientEnd: '#40C4FF',
    icon: ICON_PATHS.home,
    iconViewBox: '0 0 24 24',
    title: 'Windows 11 Home',
    subtitle: '영구 디지털 라이선스',
  },
  {
    slug: 'windows-10-pro',
    gradientStart: '#005A9E',
    gradientEnd: '#0078D4',
    icon: ICON_PATHS.laptop,
    iconViewBox: '0 0 24 24',
    title: 'Windows 10 Pro',
    subtitle: '영구 디지털 라이선스',
  },
  {
    slug: 'windows-10-home',
    gradientStart: '#005A9E',
    gradientEnd: '#2196F3',
    icon: ICON_PATHS.home,
    iconViewBox: '0 0 24 24',
    title: 'Windows 10 Home',
    subtitle: '영구 디지털 라이선스',
  },
  {
    slug: 'office-2024-pro-plus',
    gradientStart: '#D83B01',
    gradientEnd: '#FF8C00',
    icon: ICON_PATHS.star,
    iconViewBox: '0 0 24 24',
    title: 'Office 2024',
    subtitle: 'Professional Plus',
  },
  {
    slug: 'office-2021-pro-plus',
    gradientStart: '#C62828',
    gradientEnd: '#E74856',
    icon: ICON_PATHS.checkCircle,
    iconViewBox: '0 0 24 24',
    title: 'Office 2021',
    subtitle: 'Professional Plus',
  },
  {
    slug: 'office-2019-pro-plus',
    gradientStart: '#1B5E20',
    gradientEnd: '#43A047',
    icon: ICON_PATHS.fileText,
    iconViewBox: '0 0 24 24',
    title: 'Office 2019',
    subtitle: 'Professional Plus',
  },
  {
    slug: 'office-2016-pro-plus',
    gradientStart: '#1A237E',
    gradientEnd: '#3F51B5',
    icon: ICON_PATHS.layers,
    iconViewBox: '0 0 24 24',
    title: 'Office 2016',
    subtitle: 'Professional Plus',
  },
  {
    slug: 'office-365-5pc',
    gradientStart: '#BF360C',
    gradientEnd: '#FF6E40',
    icon: ICON_PATHS.cloud,
    iconViewBox: '0 0 24 24',
    title: 'Office 365',
    subtitle: '5PC / 1년 구독',
  },
]

// ─────────────────────────────────────────────
// SVG 생성 함수
// ─────────────────────────────────────────────
function generateSVG(p: ProductDesign): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.gradientStart}"/>
      <stop offset="100%" stop-color="${p.gradientEnd}"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.15)"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.08)"/>
    </linearGradient>
  </defs>

  <!-- 배경 그래디언트 -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" rx="0"/>

  <!-- 오버레이 광택 효과 -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#shine)"/>

  <!-- 배경 장식 원형 (미묘한 깊이감) -->
  <circle cx="650" cy="120" r="200" fill="rgba(255,255,255,0.05)"/>
  <circle cx="150" cy="500" r="150" fill="rgba(255,255,255,0.03)"/>
  <circle cx="700" cy="480" r="100" fill="rgba(255,255,255,0.04)"/>

  <!-- 아이콘 배경 원 -->
  <circle cx="400" cy="220" r="72" fill="rgba(255,255,255,0.15)"/>
  <circle cx="400" cy="220" r="56" fill="rgba(255,255,255,0.12)"/>

  <!-- 아이콘 (Lucide SVG path) -->
  <g transform="translate(376, 196) scale(2)">
    <path d="${p.icon}" fill="white" stroke="none"/>
  </g>

  <!-- 구분선 -->
  <line x1="300" y1="320" x2="500" y2="320" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>

  <!-- 제품명 -->
  <text x="400" y="380" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="white" letter-spacing="1">${p.title}</text>

  <!-- 서브타이틀 -->
  <text x="400" y="420" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="rgba(255,255,255,0.75)" letter-spacing="2">${p.subtitle}</text>

  <!-- 하단 WEEP 브랜딩 -->
  <text x="400" y="540" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600" fill="rgba(255,255,255,0.25)" letter-spacing="6">WEEP</text>

  <!-- 하단 라인 포인트 -->
  <rect x="350" y="555" width="100" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
</svg>`
}

// ─────────────────────────────────────────────
// 메인 실행
// ─────────────────────────────────────────────
async function main() {
  console.log('🎨 WEEP 제품 이미지 생성 + Supabase 업로드 스크립트\n')

  // 1단계: 임시 폴더 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // 2단계: 버킷 존재 확인 / 생성
  console.log('📦 Supabase Storage 버킷 확인...')
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some((b) => b.name === BUCKET)

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg'],
    })
    if (error) {
      console.error('❌ 버킷 생성 실패:', error.message)
      process.exit(1)
    }
    console.log('✅ product-images 버킷 생성 완료 (Public)\n')
  } else {
    console.log('✅ product-images 버킷 이미 존재\n')
  }

  // 3단계: 이미지 생성 + 업로드
  console.log('🖼️  이미지 생성 및 업로드 시작...\n')

  for (const product of products) {
    const fileName = `${product.slug}.webp`
    const filePath = path.join(OUTPUT_DIR, fileName)

    // SVG -> WebP 변환
    const svg = generateSVG(product)
    const webpBuffer = await sharp(Buffer.from(svg))
      .resize(WIDTH, HEIGHT)
      .webp({ quality: 85 })
      .toBuffer()

    // 로컬 저장 (백업용)
    fs.writeFileSync(filePath, webpBuffer)

    // Supabase Storage 업로드
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, webpBuffer, {
        contentType: 'image/webp',
        upsert: true,
      })

    if (error) {
      console.error(`  ❌ ${fileName} 업로드 실패: ${error.message}`)
    } else {
      const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`
      console.log(`  ✅ ${fileName} — 업로드 완료`)
      console.log(`     ${url}`)
    }
  }

  // 4단계: products 테이블 image_url 일괄 업데이트
  console.log('\n📝 products 테이블 image_url 업데이트...\n')

  for (const product of products) {
    const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${product.slug}.webp`

    const { error } = await supabase
      .from('products')
      .update({
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', product.slug)

    if (error) {
      console.error(`  ❌ ${product.slug} DB 업데이트 실패: ${error.message}`)
    } else {
      console.log(`  ✅ ${product.slug} — image_url 업데이트 완료`)
    }
  }

  // 5단계: 검증
  console.log('\n🔍 최종 검증...\n')

  const { data: updated, error: verifyError } = await supabase
    .from('products')
    .select('name, slug, image_url')
    .eq('status', 'active')
    .order('sort_order')

  if (verifyError) {
    console.error('❌ 검증 쿼리 실패:', verifyError.message)
  } else {
    console.log('┌─────────────────────────────────┬───────────────┐')
    console.log('│ 상품명                          │ image_url     │')
    console.log('├─────────────────────────────────┼───────────────┤')
    for (const row of updated || []) {
      const status = row.image_url ? '✅ 연결됨' : '❌ null'
      const name = row.name.padEnd(30)
      console.log(`│ ${name} │ ${status}      │`)
    }
    console.log('└─────────────────────────────────┴───────────────┘')
  }

  // 정리
  console.log(`\n🎉 전체 작업 완료!`)
  console.log(`   로컬 백업: ${OUTPUT_DIR}`)
  console.log(`   브라우저에서 상품 목록 확인해보세요\n`)
}

main().catch(console.error)
