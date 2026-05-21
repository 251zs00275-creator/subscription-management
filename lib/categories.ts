import type { Category, CustomKeywordRule } from '@/types'

interface KeywordRule {
  keywords: string[]
  category: Category
}

const KEYWORD_RULES: KeywordRule[] = [
  {
    keywords: [
      'netflix', 'ネットフリックス',
      'spotify', 'スポティファイ',
      'amazon prime', 'amazonプライム',
      'youtube premium', 'youtube music',
      'apple music', 'apple tv',
      'disney+', 'disney plus', 'ディズニー',
      'hulu', 'フール',
      'dazn', 'ダゾーン',
      'abema', 'アベマ',
      'u-next', 'uネクスト',
      'hbo', 'paramount',
      'adobe', 'アドビ',
      'microsoft 365', 'office 365',
      'dropbox', 'google one', 'icloud',
      'chatgpt', 'claude', 'openai',
      'github', 'notion', 'slack',
      'zoom', 'canva',
      'dマガジン', 'd マガジン', 'dmaga',
      'kindle unlimited',
      'nhkネット', 'nhk+',
    ],
    category: 'サブスク',
  },
  {
    keywords: [
      'スーパー', 'マルエツ', 'イオン', 'ライフ', 'オーケー',
      'まいばすけっと', 'ウエルシア', 'マツモトキヨシ', 'コスモス',
      'セブンイレブン', 'ファミリーマート', 'ローソン', 'ミニストップ',
      'マクドナルド', 'すき家', 'yoshinoya', '吉野家', 'なか卯',
      'サイゼリヤ', 'デニーズ', 'ガスト', 'バーガーキング',
      'スターバックス', 'タリーズ', 'ドトール', 'コメダ',
      '食料品', '食材', '弁当', '惣菜', 'フードデリバリー',
      'ubereats', 'ウーバーイーツ', 'demae-can', '出前館',
    ],
    category: '食費',
  },
  {
    keywords: [
      'docomo', 'ドコモ', 'au', 'softbank', 'ソフトバンク',
      'rakuten mobile', '楽天モバイル', 'iijmio', 'mineo',
      'ntt', 'フレッツ', 'インターネット', 'wi-fi', 'wifi',
      '携帯', 'スマートフォン', '通信', '電話',
      'linemo', 'ahamo', 'povo',
    ],
    category: '通信費',
  },
  {
    keywords: [
      'steam', 'nintendo', 'playstation', 'xbox',
      'ゲーム', '映画館', 'カラオケ', 'ボウリング',
      'ライブ', 'コンサート', 'チケット', 'イベント',
      'アミューズメント', 'レジャー', '遊園地',
      'book off', 'ブックオフ',
    ],
    category: '娯楽',
  },
  {
    keywords: [
      'jr', '東急', '小田急', '京王', '東京メトロ',
      'suica', 'pasmo', '定期', 'バス', '電車',
      '新幹線', '飛行機', 'タクシー', 'ウーバー',
      'ガソリン', '駐車場', 'エネオス', '出光',
    ],
    category: '交通費',
  },
  {
    keywords: [
      '薬局', 'ドラッグストア', '日用品', '生活用品',
      'ニトリ', 'イケア', 'コーナン', 'カインズ',
      'amazon', '楽天', 'yahoo!ショッピング',
      'メルカリ', 'zozotown',
      'ユニクロ', 'gu', 'しまむら',
    ],
    category: '日用品',
  },
  {
    keywords: [
      '病院', 'クリニック', '歯科', '薬', '処方',
      '調剤', 'ファルマ', '医療', '健康', 'フィットネス',
      'ジム', 'スポーツクラブ', 'マッサージ',
    ],
    category: '医療',
  },
]

export function detectCategory(
  description: string,
  customRules?: CustomKeywordRule[]
): Category {
  const lower = description.toLowerCase()
  if (customRules) {
    for (const rule of customRules) {
      if (lower.includes(rule.keyword.toLowerCase())) {
        return rule.category
      }
    }
  }
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return rule.category
    }
  }
  return 'その他'
}
