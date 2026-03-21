'use client'
// ============================================================
// Sara Go — Destination Detail Page
// صفحة تفاصيل الوجهة السياحية مع الباقات والمراجعات
// ============================================================

import { useState } from 'react'
import Link from 'next/link'

// ─── Static destination data for demo ────────────────────────

const DEMO_DESTINATION = {
  id: '1',
  name: 'جزر المالديف',
  country: 'المالديف',
  continent: 'آسيا',
  city: 'ماليه',
  region: 'جنوب آسيا',
  description: 'بيوت على الماء وشعاب مرجانية وأسماك ملونة تسبح في مياه فيروزية كالكريستال. المالديف ليست مجرد وجهة — إنها تجربة حياة كاملة ستبقى في ذاكرتك إلى الأبد.',
  ai_summary: 'مثالية لشهر العسل والغوص. احجز نوفمبر-أبريل للطقس الأمثل. الباقات الحصرية لـ Pi Pioneers توفر خصم 23%.',
  highlights: [
    'بنغالو خاص فوق الماء الفيروزي',
    'شعاب مرجانية بكر بين أجمل 10 في العالم',
    'رحلة مشاهدة الدلافين البرية',
    'سبا فاخر للزوجين',
    'أجمل غروب شمس على كوكب الأرض',
    'خيارات منتجعات 5 نجوم معتمدة',
  ],
  images: [
    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80',
    'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=1200&q=80',
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80',
    'https://images.unsplash.com/photo-1591016104249-ca48bff0e4e2?w=1200&q=80',
  ],
  thumbnail: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80',
  price_from_pi: 450,
  price_from_usd: 2800,
  price_range: { min_pi: 450, max_pi: 1200, min_usd: 2800, max_usd: 8000 },
  rating: 4.9,
  review_count: 1243,
  tags: ['شاطئ', 'فاخر', 'غوص', 'رومانسي', 'شهر عسل', 'Pi حصري'],
  activities: ['غوص سكوبا', 'ركوب الكانو', 'مشاهدة الدلافين', 'سبا', 'صيد سمك', 'رحلة غروب'],
  travel_style: 'Luxury',
  climate: 'استوائي',
  best_season: ['نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس', 'أبريل'],
  trending_score: 98,
  search_volume: 89000,
  booking_volume: 4500,
  is_featured: true,
  is_active: true,
  is_pi_exclusive: true,
  coordinates: { lat: 3.2028, lng: 73.2207 },
  ai_insight: '🔥 زاد الطلب 43% هذا الشهر. احجز الآن قبل نفاد المواعيد!',
  visa_info: {
    'معظم الجنسيات': 'تأشيرة عند الوصول مجاناً (30 يوم)',
    'المملكة العربية السعودية': 'تأشيرة عند الوصول',
    'الإمارات': 'تأشيرة عند الوصول',
  },
  currency_local: 'روفيا مالديفية (MVR)',
  language: 'الديفيهي / الإنجليزية',
  time_zone: 'UTC+5',
  ideal_duration_days: 7,
}

const DEMO_PACKAGES = [
  {
    id: 'pkg1',
    title: '💎 مالديف درجة أولى — بنغالو فوق الماء',
    short_description: 'أسبوع فاخر مع بنغالو خاص، غوص، سبا، ودلافين',
    price_pi: 850,
    price_usd: 5200,
    original_price_pi: 1100,
    discount_percent: 23,
    duration_days: 7,
    duration_nights: 6,
    rating: 4.97,
    review_count: 342,
    is_pi_exclusive: true,
    is_sold_out: false,
    highlights: ['بنغالو فوق الماء', 'غوص في شعاب مرجانية', 'سبا للزوجين', 'رحلة الدلافين'],
    includes: ['طيران اقتصادي + سيبلان', '6 ليالي بنغالو فوق الماء', 'إفطار وعشاء يومياً', 'غوص (جلستان)', 'سبا 60 دقيقة'],
  },
  {
    id: 'pkg2',
    title: '🌊 مالديف عائلي — جزيرة مع مسبح خاص',
    short_description: '5 ليالٍ مع مسبح خاص وأنشطة للأطفال',
    price_pi: 620,
    price_usd: 3800,
    original_price_pi: 750,
    discount_percent: 17,
    duration_days: 6,
    duration_nights: 5,
    rating: 4.85,
    review_count: 198,
    is_pi_exclusive: false,
    is_sold_out: false,
    highlights: ['فيلا بمسبح خاص', 'ألعاب مائية للأطفال', 'كايت سيرفينج', 'نزهة جزيرة مهجورة'],
    includes: ['تذاكر طيران', '5 ليالي فيلا بمسبح', 'إفطار يومي', 'كلوب الأطفال', 'رحلة بحرية'],
  },
  {
    id: 'pkg3',
    title: '🤿 مالديف للغوص المتقدم',
    short_description: '8 أيام لعشاق الغوص في أعماق المالديف',
    price_pi: 700,
    price_usd: 4300,
    original_price_pi: 800,
    discount_percent: 12,
    duration_days: 8,
    duration_nights: 7,
    rating: 4.92,
    review_count: 156,
    is_pi_exclusive: true,
    is_sold_out: false,
    highlights: ['12 غوصة متخصصة', 'مع مدرب PADI معتمد', 'رؤية سمك القرش الحوت', 'تصوير تحت الماء'],
    includes: ['إقامة على قارب سفاري', '12 غوصة مدارة', 'جميع المعدات', 'شهادة PADI', 'تصوير تحت الماء'],
  },
]

const DEMO_REVIEWS = [
  {
    id: 'r1',
    user_name: 'أحمد الراشدي',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed',
    user_pi_username: '@ahmed_rashidi',
    rating: 5.0,
    title: 'شهر العسل الأحلى في حياتنا! 🌊',
    body: 'زوجتي وأنا أمضينا 7 أيام لا تُنسى في المالديف. البنغالو فوق الماء كان أجمل بكثير من أي صورة. الدفع بـ Pi كان سلساً وأسرع من أي بطاقة. سنعود بالتأكيد!',
    pros: ['البنغالو فوق الماء رائع جداً', 'خدمة ممتازة', 'الدفع بـ Pi سريع'],
    cons: ['التنقل بين الجزر يأخذ وقتاً'],
    travel_date: '2024-12-15',
    travel_type: 'شهر العسل',
    verified_booking: true,
    helpful_votes: 156,
  },
  {
    id: 'r2',
    user_name: 'نورة القحطاني',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noura',
    user_pi_username: '@noura_q',
    rating: 4.8,
    title: 'حلم صار حقيقة بفضل Pi! 💎',
    body: 'كنت أحلم بالمالديف منذ سنوات، ولما عرفت إنه ممكن أدفع بـ Pi حجزت فوراً! التجربة تجاوزت كل توقعاتي.',
    pros: ['المياه الفيروزية لا تصدق', 'الشعاب المرجانية بكر', 'يمكن الدفع بـ Pi'],
    cons: ['الأكل غالي في المنتجع'],
    travel_date: '2025-01-20',
    travel_type: 'مع صديقات',
    verified_booking: true,
    helpful_votes: 89,
  },
  {
    id: 'r3',
    user_name: 'سلطان المسعود',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sultan',
    user_pi_username: '@sultan_m',
    rating: 4.9,
    title: 'لن أنسى رحلة الدلافين ما حييت 🐬',
    body: 'ظننت أن رحلة الدلافين ستكون مجرد تجربة عادية لكنها كانت أكثر الأشياء إثارة في حياتي. الدلافين اقتربت من القارب وصوتها وابتسامتها لا تُنسى.',
    pros: ['رحلة الدلافين استثنائية', 'الغروب مؤثر للغاية', 'الخدمة في البنغالو ممتازة'],
    cons: ['السعر مرتفع لكنه يستحق'],
    travel_date: '2025-02-10',
    travel_type: 'مع الزوجة',
    verified_booking: true,
    helpful_votes: 134,
  },
]

// ─── Stars Component ──────────────────────────────────────────

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  return (
    <div className={`flex gap-0.5 ${size === 'lg' ? 'text-2xl' : 'text-sm'}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={rating >= i ? 'text-yellow-400' : rating >= i - 0.5 ? 'text-yellow-400/60' : 'text-gray-600'}>
          ★
        </span>
      ))}
    </div>
  )
}

// ─── Main Detail Page ─────────────────────────────────────────

export default function DestinationDetailPage() {
  const dest = DEMO_DESTINATION
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'reviews'>('overview')

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white" dir="rtl">
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src={dest.images[activeImage]}
          alt={dest.name}
          className="w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

        {/* Image Thumbnails */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          {dest.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                activeImage === i ? 'border-yellow-400 scale-110' : 'border-white/30'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Breadcrumb */}
        <div className="absolute top-6 right-6 flex items-center gap-2 text-white/60 text-sm">
          <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
          <span>/</span>
          <Link href="/destinations" className="hover:text-white transition-colors">الوجهات</Link>
          <span>/</span>
          <span className="text-white">{dest.name}</span>
        </div>

        {/* Hero Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-white/60">{dest.continent} · {dest.country}</span>
                  {dest.is_pi_exclusive && (
                    <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                      π حصري
                    </span>
                  )}
                  {dest.trending_score >= 90 && (
                    <span className="bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-full">
                      🔥 رائج
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{dest.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Stars rating={dest.rating} size="sm" />
                    <span className="text-white font-bold">{dest.rating}</span>
                    <span className="text-white/50">({dest.review_count.toLocaleString('ar')} تقييم)</span>
                  </div>
                  <span className="text-white/30">|</span>
                  <span className="text-white/60">⏱️ {dest.ideal_duration_days} أيام مثالية</span>
                </div>
              </div>
              {/* Price Box */}
              <div className="hidden md:block bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-right">
                <div className="text-white/60 text-sm mb-1">يبدأ من</div>
                <div className="text-yellow-400 font-black text-3xl">{dest.price_from_pi}π</div>
                <div className="text-white/40 text-sm">${dest.price_from_usd.toLocaleString()}</div>
                <Link
                  href="#packages"
                  className="block mt-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-sm px-5 py-2 rounded-xl text-center hover:opacity-90 transition-opacity"
                >
                  احجز الآن
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insight Banner */}
      <div className="bg-yellow-400/10 border-y border-yellow-400/20 py-3">
        <div className="max-w-5xl mx-auto px-8 flex items-center gap-3">
          <span className="text-yellow-400 text-xl">🤖</span>
          <p className="text-yellow-300 text-sm font-medium">{dest.ai_insight}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'نظرة عامة' },
              { id: 'packages', label: `الباقات (${DEMO_PACKAGES.length})` },
              { id: 'reviews', label: `التقييمات (${DEMO_REVIEWS.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-yellow-400 border-yellow-400'
                    : 'text-white/50 border-transparent hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-3">عن الوجهة</h2>
                <p className="text-white/70 leading-relaxed text-lg">{dest.description}</p>
              </div>

              {/* AI Summary */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-purple-300 font-bold">ملخص الذكاء الاصطناعي</h3>
                </div>
                <p className="text-purple-200/70 leading-relaxed">{dest.ai_summary}</p>
              </div>

              {/* Highlights */}
              <div>
                <h2 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-3">أبرز المعالم</h2>
                <ul className="grid grid-cols-2 gap-3">
                  {dest.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                      <span className="text-yellow-400 mt-0.5">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Activities */}
              <div>
                <h2 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-3">الأنشطة المتاحة</h2>
                <div className="flex flex-wrap gap-2">
                  {dest.activities.map(a => (
                    <span key={a} className="bg-white/10 border border-white/10 text-white/70 text-sm px-3 py-1.5 rounded-xl">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Quick Info */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">معلومات سريعة</h3>
                {[
                  { icon: '🌡️', label: 'المناخ', value: dest.climate },
                  { icon: '🗣️', label: 'اللغة', value: dest.language },
                  { icon: '💱', label: 'العملة', value: dest.currency_local },
                  { icon: '🕐', label: 'التوقيت', value: dest.time_zone },
                  { icon: '✈️', label: 'المدة المثالية', value: `${dest.ideal_duration_days} أيام` },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/40 text-sm">{item.label}</span>
                    <span className="text-white/80 text-sm flex items-center gap-1">
                      <span>{item.icon}</span> {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Best Season */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-3">أفضل مواسم الزيارة</h3>
                <div className="flex flex-wrap gap-2">
                  {dest.best_season.map(m => (
                    <span key={m} className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-lg">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visa Info */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-3">🛂 معلومات التأشيرة</h3>
                {Object.entries(dest.visa_info).map(([k, v]) => (
                  <div key={k} className="text-sm py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-white/50">{k}:</span>
                    <span className="text-green-400 mr-2">{v as string}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-3">الوسوم</h3>
                <div className="flex flex-wrap gap-2">
                  {dest.tags.map(t => (
                    <span key={t} className="bg-white/10 text-white/60 text-xs px-2 py-1 rounded-full">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Packages Tab ── */}
        {activeTab === 'packages' && (
          <div id="packages" className="space-y-6">
            <h2 className="text-white text-2xl font-bold">الباقات المتاحة للمالديف</h2>
            {DEMO_PACKAGES.map(pkg => (
              <div key={pkg.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-yellow-400/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="text-white font-bold text-xl">{pkg.title}</h3>
                      {pkg.is_pi_exclusive && (
                        <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                          π حصري
                        </span>
                      )}
                      {pkg.is_sold_out && (
                        <span className="bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-full">
                          محجوز
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 mb-4">{pkg.short_description}</p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pkg.highlights.map(h => (
                        <span key={h} className="flex items-center gap-1 text-white/70 text-sm bg-white/10 px-3 py-1 rounded-full">
                          <span className="text-green-400">✓</span> {h}
                        </span>
                      ))}
                    </div>

                    {/* Includes */}
                    <details className="group">
                      <summary className="text-yellow-400 text-sm cursor-pointer hover:text-yellow-300">
                        ما يشمله السعر ▼
                      </summary>
                      <ul className="mt-2 space-y-1">
                        {pkg.includes.map((inc, i) => (
                          <li key={i} className="text-white/60 text-sm flex items-center gap-2">
                            <span className="text-green-400 text-xs">✓</span> {inc}
                          </li>
                        ))}
                      </ul>
                    </details>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Stars rating={pkg.rating} />
                        <span className="text-white/60 text-sm">({pkg.review_count})</span>
                      </div>
                      <span className="text-white/40 text-sm">⏱️ {pkg.duration_days} أيام / {pkg.duration_nights} ليالٍ</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-right min-w-[160px]">
                    {pkg.discount_percent > 0 && (
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-full">
                          -{pkg.discount_percent}%
                        </span>
                        <span className="text-white/40 text-sm line-through">{pkg.original_price_pi}π</span>
                      </div>
                    )}
                    <div className="text-yellow-400 font-black text-2xl">{pkg.price_pi}π</div>
                    <div className="text-white/40 text-sm mb-3">${pkg.price_usd.toLocaleString()}</div>
                    <button
                      disabled={pkg.is_sold_out}
                      className={`w-full py-2 rounded-xl font-bold text-sm transition-opacity ${
                        pkg.is_sold_out
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:opacity-90'
                      }`}
                    >
                      {pkg.is_sold_out ? 'محجوز بالكامل' : 'احجز الآن'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Reviews Tab ── */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8">
              <div className="text-center">
                <div className="text-yellow-400 font-black text-6xl">{dest.rating}</div>
                <Stars rating={dest.rating} size="lg" />
                <div className="text-white/50 text-sm mt-1">{dest.review_count.toLocaleString('ar')} تقييم</div>
              </div>
              <div className="flex-1 space-y-2 w-full">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-white/50 text-sm w-4">{star}★</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : star === 2 ? 1 : 1}%` }}
                      />
                    </div>
                    <span className="text-white/40 text-xs w-8">{star === 5 ? '78%' : star === 4 ? '15%' : star === 3 ? '5%' : '1%'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            {DEMO_REVIEWS.map(review => (
              <div key={review.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start gap-4 mb-4">
                  <img src={review.user_avatar} alt={review.user_name} className="w-12 h-12 rounded-full bg-purple-500/20" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{review.user_name}</span>
                      {review.verified_booking && (
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">✓ حجز مؤكد</span>
                      )}
                    </div>
                    <div className="text-white/40 text-xs">{review.user_pi_username} · {review.travel_type} · {review.travel_date}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Stars rating={review.rating} />
                      <span className="text-yellow-400 text-sm font-bold">{review.rating}</span>
                    </div>
                  </div>
                </div>

                <h4 className="text-white font-semibold mb-2">{review.title}</h4>
                <p className="text-white/60 text-sm leading-relaxed mb-3">{review.body}</p>

                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  {review.pros.length > 0 && (
                    <div>
                      <div className="text-green-400 text-xs font-bold mb-1">✓ الإيجابيات</div>
                      {review.pros.map((p, i) => <div key={i} className="text-white/60 text-xs">• {p}</div>)}
                    </div>
                  )}
                  {review.cons.length > 0 && (
                    <div>
                      <div className="text-red-400 text-xs font-bold mb-1">✗ السلبيات</div>
                      {review.cons.map((c, i) => <div key={i} className="text-white/60 text-xs">• {c}</div>)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <span>هل كانت مفيدة؟</span>
                  <button className="hover:text-white transition-colors">👍 {review.helpful_votes}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md border-t border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/60 text-xs">يبدأ من</div>
            <div className="text-yellow-400 font-black text-xl">{dest.price_from_pi}π</div>
          </div>
          <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-8 py-3 rounded-xl">
            احجز الآن
          </button>
        </div>
      </div>
    </main>
  )
}
