import type { Category, SubscriptionFormData } from '@/types'

export type PresetBillingCycle = 'monthly' | 'annual' | 'quarterly'
export type SubscriptionPresetGroup =
  | '動画・映画'
  | '音楽・音声'
  | '読書・学習'
  | 'クラウド・ストレージ'
  | 'ゲーム'
  | '仕事・制作'
  | '生活・総合'

export interface SubscriptionPresetPlan {
  id: string
  name: string
  amount: number
  billingCycle: PresetBillingCycle
  monthlyAmount: number
  description: string
}

export interface SubscriptionPreset {
  id: string
  serviceName: string
  category: Category
  group: SubscriptionPresetGroup
  sourceName: string
  sourceUrl: string
  checkedAt: string
  plans: SubscriptionPresetPlan[]
}

export const SUBSCRIPTION_PRESETS: SubscriptionPreset[] = [
  {
    id: 'amazon-prime',
    serviceName: 'Amazon Prime',
    category: 'サブスク',
    group: '生活・総合',
    sourceName: 'Amazon.co.jp / About Amazon Japan',
    sourceUrl: 'https://www.aboutamazon.jp/news/amazon-prime/prime-membership-seven-benefits',
    checkedAt: '2026-05-20',
    plans: [
      plan('monthly', '月額プラン', 600, 'monthly', 'Prime Video、配送特典、Prime Readingなど'),
      plan('annual', '年額プラン', 5900, 'annual', '年払い。月額換算で登録'),
      plan('student-monthly', 'Prime Student 月額', 300, 'monthly', '学生向けプラン'),
      plan('student-annual', 'Prime Student 年額', 2950, 'annual', '学生向け年払い。月額換算で登録'),
    ],
  },
  {
    id: 'spotify',
    serviceName: 'Spotify Premium',
    category: 'サブスク',
    group: '音楽・音声',
    sourceName: 'Spotify Premium 公式',
    sourceUrl: 'https://www.spotify.com/jp/premium/',
    checkedAt: '2026-05-20',
    plans: [
      plan('standard', 'Standard', 1080, 'monthly', '1つのPremiumアカウント'),
      plan('student', 'Student', 580, 'monthly', '認証された学生向け'),
      plan('duo', 'Duo', 1480, 'monthly', '同居する2人向け'),
      plan('family', 'Family', 1880, 'monthly', '最大6アカウント向け'),
    ],
  },
  {
    id: 'netflix',
    serviceName: 'Netflix',
    category: 'サブスク',
    group: '動画・映画',
    sourceName: 'Netflix 公式サイト / 公開料金情報',
    sourceUrl: 'https://www.netflix.com/jp/',
    checkedAt: '2026-05-20',
    plans: [
      plan('ads-standard', '広告つきスタンダード', 890, 'monthly', '広告あり、フルHD'),
      plan('standard', 'スタンダード', 1590, 'monthly', '広告なし、フルHD'),
      plan('premium', 'プレミアム', 2290, 'monthly', '広告なし、4K対応'),
    ],
  },
  {
    id: 'disney-plus',
    serviceName: 'Disney+',
    category: 'サブスク',
    group: '動画・映画',
    sourceName: 'Disney+ 公式',
    sourceUrl: 'https://www.disneyplus.com/ja-jp',
    checkedAt: '2026-05-20',
    plans: [
      plan('standard', 'スタンダード', 1250, 'monthly', 'フルHD、2台同時視聴'),
      plan('premium', 'プレミアム', 1670, 'monthly', '4K UHD、4台同時視聴'),
    ],
  },
  {
    id: 'apple-music',
    serviceName: 'Apple Music',
    category: 'サブスク',
    group: '音楽・音声',
    sourceName: 'Apple Music 公式',
    sourceUrl: 'https://www.apple.com/jp/apple-music/',
    checkedAt: '2026-05-20',
    plans: [
      plan('individual', '個人', 1080, 'monthly', '個人向け音楽サブスク'),
      plan('student', '学生', 580, 'monthly', '認証された学生向け'),
      plan('family', 'ファミリー', 1680, 'monthly', '最大5人と共有'),
    ],
  },
  {
    id: 'icloud-plus',
    serviceName: 'iCloud+',
    category: 'サブスク',
    group: 'クラウド・ストレージ',
    sourceName: 'Apple iCloud+ 公式',
    sourceUrl: 'https://www.apple.com/jp/icloud/',
    checkedAt: '2026-05-20',
    plans: [
      plan('50gb', '50GB', 150, 'monthly', '写真・ファイル・バックアップ用'),
      plan('200gb', '200GB', 450, 'monthly', 'ファミリー共有対応'),
      plan('2tb', '2TB', 1500, 'monthly', '大容量ストレージ'),
    ],
  },
  {
    id: 'u-next',
    serviceName: 'U-NEXT',
    category: 'サブスク',
    group: '動画・映画',
    sourceName: 'U-NEXT ヘルプセンター',
    sourceUrl: 'https://help.unext.jp/guide/detail/types-of-service-plan',
    checkedAt: '2026-05-20',
    plans: [
      plan('monthly', '月額プラン', 2189, 'monthly', '毎月1,200ポイント付与'),
    ],
  },
  {
    id: 'hulu',
    serviceName: 'Hulu',
    category: 'サブスク',
    group: '動画・映画',
    sourceName: 'Hulu公開料金情報',
    sourceUrl: 'https://www.hulu.jp/',
    checkedAt: '2026-05-20',
    plans: [
      plan('monthly', '見放題プラン', 1026, 'monthly', '定額制見放題プラン'),
    ],
  },
  {
    id: 'dmm-premium',
    serviceName: 'DMMプレミアム',
    category: 'サブスク',
    group: '動画・映画',
    sourceName: 'DMMヘルプセンター',
    sourceUrl: 'https://support.dmm.com/premium/article/47489',
    checkedAt: '2026-05-20',
    plans: [
      plan('monthly', '月額プラン', 550, 'monthly', 'DMM TV対象作品など'),
      plan('app-store', 'アプリ内課金', 650, 'monthly', 'Apple / Google Play経由'),
    ],
  },
  {
    id: 'abema-premium',
    serviceName: 'ABEMAプレミアム',
    category: 'サブスク',
    group: '動画・映画',
    sourceName: 'ABEMAヘルプ',
    sourceUrl: 'https://help.abema.tv/hc/ja/articles/55297041707545',
    checkedAt: '2026-05-20',
    plans: [
      plan('premium', 'ABEMAプレミアム', 1180, 'monthly', '広告なしの見逃し配信など'),
      plan('with-ads', '広告つきABEMAプレミアム', 680, 'monthly', '広告つき低価格プラン'),
    ],
  },
  {
    id: 'youtube-premium',
    serviceName: 'YouTube Premium',
    category: 'サブスク',
    group: '動画・映画',
    sourceName: 'YouTube Premium 公式',
    sourceUrl: 'https://www.youtube.com/premium',
    checkedAt: '2026-05-20',
    plans: [
      plan('individual', '個人', 1280, 'monthly', '広告なし再生、バックグラウンド再生、YouTube Music Premium込み'),
      plan('student', '学生', 780, 'monthly', '認証された学生向け'),
      plan('family', 'ファミリー', 2280, 'monthly', '同世帯の家族向け'),
    ],
  },
  {
    id: 'danime-store',
    serviceName: 'dアニメストア',
    category: 'サブスク',
    group: '動画・映画',
    sourceName: 'dアニメストア公式',
    sourceUrl: 'https://animestore.docomo.ne.jp/animestore/CF/lp',
    checkedAt: '2026-05-20',
    plans: [
      plan('monthly', '月額プラン', 550, 'monthly', 'アニメ専門の見放題サービス'),
    ],
  },
  {
    id: 'amazon-music-unlimited',
    serviceName: 'Amazon Music Unlimited',
    category: 'サブスク',
    group: '音楽・音声',
    sourceName: 'Amazon Music 公式',
    sourceUrl: 'https://www.amazon.co.jp/music/unlimited',
    checkedAt: '2026-05-20',
    plans: [
      plan('individual', '個人プラン', 1080, 'monthly', 'Prime会員以外の個人向け料金'),
      plan('prime-individual', 'Prime会員 個人プラン', 980, 'monthly', 'Prime会員向け個人プラン'),
      plan('family', 'ファミリープラン', 1680, 'monthly', '最大6アカウント向け'),
    ],
  },
  {
    id: 'audible',
    serviceName: 'Audible',
    category: 'サブスク',
    group: '音楽・音声',
    sourceName: 'Audible 公式',
    sourceUrl: 'https://www.audible.co.jp/',
    checkedAt: '2026-05-20',
    plans: [
      plan('monthly', '月額プラン', 1500, 'monthly', 'オーディオブック聴き放題対象作品'),
    ],
  },
  {
    id: 'kindle-unlimited',
    serviceName: 'Kindle Unlimited',
    category: 'サブスク',
    group: '読書・学習',
    sourceName: 'Amazon Kindle Unlimited 公式',
    sourceUrl: 'https://www.amazon.co.jp/kindle-dbs/hz/subscribe/ku',
    checkedAt: '2026-05-20',
    plans: [
      plan('monthly', '月額プラン', 980, 'monthly', '電子書籍の読み放題対象作品'),
    ],
  },
  {
    id: 'google-one',
    serviceName: 'Google One',
    category: 'サブスク',
    group: 'クラウド・ストレージ',
    sourceName: 'Google One 公式',
    sourceUrl: 'https://one.google.com/about/plans',
    checkedAt: '2026-05-20',
    plans: [
      plan('basic-100gb', 'ベーシック 100GB', 290, 'monthly', 'Googleストレージ100GB'),
      plan('standard-200gb', 'スタンダード 200GB', 440, 'monthly', 'Googleストレージ200GB'),
      plan('premium-2tb', 'プレミアム 2TB', 1450, 'monthly', 'Googleストレージ2TB'),
    ],
  },
  {
    id: 'microsoft-365',
    serviceName: 'Microsoft 365',
    category: 'サブスク',
    group: '仕事・制作',
    sourceName: 'Microsoft 365 公式',
    sourceUrl: 'https://www.microsoft.com/ja-jp/microsoft-365/buy/compare-all-microsoft-365-products',
    checkedAt: '2026-05-20',
    plans: [
      plan('personal-monthly', 'Personal 月額', 2130, 'monthly', '1人向け Office アプリとクラウドストレージ'),
      plan('personal-annual', 'Personal 年額', 21300, 'annual', '1人向け年払い。月額換算で登録'),
      plan('family-monthly', 'Family 月額', 2740, 'monthly', '最大6人向け'),
      plan('family-annual', 'Family 年額', 27400, 'annual', '最大6人向け年払い。月額換算で登録'),
    ],
  },
  {
    id: 'canva-pro',
    serviceName: 'Canva Pro',
    category: 'サブスク',
    group: '仕事・制作',
    sourceName: 'Canva 価格ページ',
    sourceUrl: 'https://www.canva.com/ja_jp/pricing/',
    checkedAt: '2026-05-20',
    plans: [
      plan('monthly', '月額プラン', 1180, 'monthly', '個人向けデザイン制作プラン'),
      plan('annual', '年額プラン', 11800, 'annual', '年払い。月額換算で登録'),
    ],
  },
  {
    id: 'dropbox',
    serviceName: 'Dropbox',
    category: 'サブスク',
    group: 'クラウド・ストレージ',
    sourceName: 'Dropbox 価格ページ',
    sourceUrl: 'https://www.dropbox.com/ja/plans',
    checkedAt: '2026-05-20',
    plans: [
      plan('plus-monthly', 'Plus 月額', 1500, 'monthly', '個人向け2TBストレージ'),
      plan('plus-annual', 'Plus 年額', 14400, 'annual', '個人向け2TB年払い。月額換算で登録'),
    ],
  },
  {
    id: 'playstation-plus',
    serviceName: 'PlayStation Plus',
    category: 'サブスク',
    group: 'ゲーム',
    sourceName: 'PlayStation Plus 公式',
    sourceUrl: 'https://www.playstation.com/ja-jp/ps-plus/',
    checkedAt: '2026-05-20',
    plans: [
      plan('essential-1m', 'Essential 1か月', 850, 'monthly', 'オンラインマルチプレイなど'),
      plan('essential-12m', 'Essential 12か月', 6800, 'annual', 'Essential年払い。月額換算で登録'),
      plan('extra-1m', 'Extra 1か月', 1300, 'monthly', 'ゲームカタログ込み'),
      plan('extra-12m', 'Extra 12か月', 11700, 'annual', 'Extra年払い。月額換算で登録'),
      plan('premium-1m', 'Premium 1か月', 1550, 'monthly', 'クラシックスカタログなど込み'),
      plan('premium-12m', 'Premium 12か月', 13900, 'annual', 'Premium年払い。月額換算で登録'),
    ],
  },
  {
    id: 'xbox-game-pass',
    serviceName: 'Xbox Game Pass',
    category: 'サブスク',
    group: 'ゲーム',
    sourceName: 'Xbox Game Pass 公式',
    sourceUrl: 'https://www.xbox.com/ja-JP/xbox-game-pass',
    checkedAt: '2026-05-20',
    plans: [
      plan('pc', 'PC Game Pass', 990, 'monthly', 'PC向けゲームライブラリ'),
      plan('ultimate', 'Ultimate', 1450, 'monthly', 'コンソール/PC/クラウド向け'),
    ],
  },
  {
    id: 'nintendo-switch-online',
    serviceName: 'Nintendo Switch Online',
    category: 'サブスク',
    group: 'ゲーム',
    sourceName: '任天堂サポート',
    sourceUrl: 'https://support.nintendo.com/jp/nso/plan/individual/index.html',
    checkedAt: '2026-05-20',
    plans: [
      plan('individual-monthly', '個人 1か月', 306, 'monthly', '1人用プラン'),
      plan('individual-quarterly', '個人 3か月', 815, 'quarterly', '3か月利用券。月額換算で登録'),
      plan('individual-annual', '個人 12か月', 2400, 'annual', '12か月利用券。月額換算で登録'),
      plan('expansion-annual', '個人 追加パック 12か月', 4900, 'annual', '追加パック込み。月額換算で登録'),
    ],
  },
]

export const SUBSCRIPTION_PRESET_GROUPS: SubscriptionPresetGroup[] = [
  '動画・映画',
  '音楽・音声',
  '読書・学習',
  'クラウド・ストレージ',
  'ゲーム',
  '仕事・制作',
  '生活・総合',
]

function plan(
  id: string,
  name: string,
  amount: number,
  billingCycle: PresetBillingCycle,
  description: string
): SubscriptionPresetPlan {
  return {
    id,
    name,
    amount,
    billingCycle,
    monthlyAmount: toMonthlyAmount(amount, billingCycle),
    description,
  }
}

export function toMonthlyAmount(amount: number, billingCycle: PresetBillingCycle): number {
  if (billingCycle === 'annual') return Math.round(amount / 12)
  if (billingCycle === 'quarterly') return Math.round(amount / 3)
  return amount
}

export function formatPresetPlanLabel(preset: SubscriptionPreset, plan: SubscriptionPresetPlan): string {
  const billing = plan.billingCycle === 'annual' ? '年額' : plan.billingCycle === 'quarterly' ? '3か月' : '月額'
  const suffix = plan.monthlyAmount === plan.amount ? `¥${plan.amount.toLocaleString()}` : `¥${plan.monthlyAmount.toLocaleString()}/月換算`
  return `${preset.serviceName} / ${plan.name}（${billing}: ${suffix}）`
}

export function findSubscriptionPresetPlan(value: string) {
  const [presetId, planId] = value.split(':')
  const preset = SUBSCRIPTION_PRESETS.find((item) => item.id === presetId)
  const plan = preset?.plans.find((item) => item.id === planId)
  return preset && plan ? { preset, plan } : null
}

export function toSubscriptionFormData(
  preset: SubscriptionPreset,
  plan: SubscriptionPresetPlan,
  current: SubscriptionFormData
): SubscriptionFormData {
  const billingLabel = plan.billingCycle === 'annual' ? '年額' : plan.billingCycle === 'quarterly' ? '3か月' : '月額'
  const amountLabel =
    plan.monthlyAmount === plan.amount
      ? `${billingLabel} ${plan.amount.toLocaleString()}円`
      : `${billingLabel} ${plan.amount.toLocaleString()}円（月額換算 ${plan.monthlyAmount.toLocaleString()}円）`

  return {
    ...current,
    name: preset.serviceName,
    amount: plan.monthlyAmount,
    category: preset.category,
    memo: [
      `${plan.name}: ${amountLabel}`,
      plan.description,
      `料金確認日: ${preset.checkedAt}`,
      `参照: ${preset.sourceName} ${preset.sourceUrl}`,
    ].join('\n'),
    isActive: true,
  }
}
