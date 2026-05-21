export type CharacterId = 'main-heroine' | 'analyst-cool' | 'reminder-jirai' | 'advisor-danger'

export type CharacterRole = 'guide' | 'analysis' | 'reminder' | 'advisor'
export type CharacterExpression = 'normal' | 'happy' | 'worried' | 'alert'
export type AppFeature =
  | 'dashboard'
  | 'subscriptions'
  | 'import'
  | 'receipt'
  | 'history'
  | 'trends'
  | 'suggestions'
  | 'achievements'

export interface AppCharacter {
  id: CharacterId
  role: CharacterRole
  name: string
  title: string
  portrait: string
  mascot: string
  pose: string
  coachMascot: string
  gallery: {
    id: string
    title: string
    image: string
    requiredLevel: number
    description: string
  }[]
  personality: string
  stats: {
    charm: number
    insight: number
    support: number
  }
  expressions: Record<CharacterExpression, string>
  accent: string
  glow: string
  featureLead: AppFeature[]
  assignment: string
}

function characterAssets(character: CharacterId) {
  return {
    portrait: `/characters/${character}/optimized/portrait.jpg`,
    mascot: `/characters/${character}/optimized/mascot.jpg`,
    pose: `/characters/${character}/poses/guide-alt.jpg`,
    coachMascot: `/characters/${character}/mascot/coach.jpg`,
    galleryImage: `/characters/${character}/gallery/affection-1.jpg`,
    expressions: {
      normal: `/characters/${character}/expressions/normal.jpg`,
      happy: `/characters/${character}/expressions/happy.jpg`,
      worried: `/characters/${character}/expressions/worried.jpg`,
      alert: `/characters/${character}/expressions/alert.jpg`,
    },
  }
}

const mio = characterAssets('main-heroine')
const shion = characterAssets('analyst-cool')
const ririka = characterAssets('reminder-jirai')
const reina = characterAssets('advisor-danger')

export const CHARACTERS: Record<CharacterId, AppCharacter> = {
  'main-heroine': {
    id: 'main-heroine',
    role: 'guide',
    name: 'ミオ',
    title: '日常サポート担当',
    ...mio,
    gallery: [
      {
        id: 'main-heroine-affection-1',
        title: '放課後サポート',
        image: mio.galleryImage,
        requiredLevel: 2,
        description: 'いつものお世話係として、少しだけ距離が近くなった一枚。',
      },
    ],
    personality: '落ち着いていて、ふんわり寄り添う学園ヒロイン。毎日の支出整理を自然に支えてくれます。',
    stats: { charm: 92, insight: 70, support: 96 },
    accent: '#FF92B6',
    glow: 'rgba(255,146,182,0.28)',
    featureLead: ['dashboard', 'subscriptions'],
    assignment: 'ダッシュボードとサブスク管理の案内役',
  },
  'analyst-cool': {
    id: 'analyst-cool',
    role: 'analysis',
    name: 'シオン',
    title: 'クール分析担当',
    ...shion,
    gallery: [
      {
        id: 'analyst-cool-affection-1',
        title: '静かな分析室',
        image: shion.galleryImage,
        requiredLevel: 2,
        description: '数字の裏側まで読み解く、クールな相談役の一面。',
      },
    ],
    personality: '冷静で知的。履歴や推移を見ながら、無駄の原因を丁寧に整理してくれます。',
    stats: { charm: 78, insight: 98, support: 82 },
    accent: '#5BA8FF',
    glow: 'rgba(91,168,255,0.28)',
    featureLead: ['history', 'trends'],
    assignment: '購入履歴と推移分析のデータ担当',
  },
  'reminder-jirai': {
    id: 'reminder-jirai',
    role: 'reminder',
    name: 'リリカ',
    title: 'リマインダー担当',
    ...ririka,
    gallery: [
      {
        id: 'reminder-jirai-affection-1',
        title: '出席簿チェック',
        image: ririka.galleryImage,
        requiredLevel: 2,
        description: 'ログインや実績を見逃さない、少し甘めのリマインダー。',
      },
    ],
    personality: '感情表現が豊かで、ログインボーナスや実績を楽しく知らせてくれます。',
    stats: { charm: 88, insight: 74, support: 90 },
    accent: '#FF4FA3',
    glow: 'rgba(255,79,163,0.3)',
    featureLead: ['import', 'receipt', 'achievements'],
    assignment: '取り込み、レシート、実績通知の担当',
  },
  'advisor-danger': {
    id: 'advisor-danger',
    role: 'advisor',
    name: 'レイナ',
    title: '月次レビュー担当',
    ...reina,
    gallery: [
      {
        id: 'advisor-danger-affection-1',
        title: '危険な節約相談',
        image: reina.galleryImage,
        requiredLevel: 2,
        description: '甘い言葉で支出の隙を突く、危険なお姉さんの助言。',
      },
    ],
    personality: '妖しさのある大人のお姉さん。節約提案では少し危険なほど鋭く踏み込みます。',
    stats: { charm: 96, insight: 90, support: 76 },
    accent: '#B85CFF',
    glow: 'rgba(184,92,255,0.26)',
    featureLead: ['suggestions'],
    assignment: '改善提案と固定費見直しの助言担当',
  },
}

export function getCharacter(id: CharacterId): AppCharacter {
  return CHARACTERS[id]
}

export const FEATURE_CHARACTER: Record<AppFeature, CharacterId> = {
  dashboard: 'main-heroine',
  subscriptions: 'main-heroine',
  import: 'reminder-jirai',
  receipt: 'reminder-jirai',
  history: 'analyst-cool',
  trends: 'analyst-cool',
  suggestions: 'advisor-danger',
  achievements: 'reminder-jirai',
}

export const FEATURE_LABELS: Record<AppFeature, string> = {
  dashboard: 'ダッシュボード',
  subscriptions: 'サブスク管理',
  import: 'CSV取込',
  receipt: 'レシート読取',
  history: '購入履歴',
  trends: '推移分析',
  suggestions: '改善提案',
  achievements: '実績',
}

export function getFeatureCharacter(feature: AppFeature): AppCharacter {
  return CHARACTERS[FEATURE_CHARACTER[feature]]
}
