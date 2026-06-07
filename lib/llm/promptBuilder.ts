import type { Subscription } from '@/types'

interface AnalysisSubscriptionView {
  name: string
  amount: number
  category: string
  isActive: boolean
  nextPaymentDate: string
}

function toAnalysisView(subscription: Subscription): AnalysisSubscriptionView {
  return {
    name: subscription.name,
    amount: subscription.amount,
    category: subscription.category,
    isActive: subscription.isActive,
    nextPaymentDate: subscription.nextPaymentDate,
  }
}

export function buildAnalysisPrompt(subscriptions: Subscription[]): string {
  const views = subscriptions.map(toAnalysisView)

  return `あなたは家計の固定費を分析するアシスタントです。
以下のサブスクリプション・定額サービスの一覧を分析し、支出を見直すための提案を作成してください。

## サブスク一覧（JSON）
${JSON.stringify(views, null, 2)}

## 出力形式
必ず次の形式の JSON 配列のみを出力してください。配列の各要素は次のフィールドを持ちます。
- title: 提案の見出し（短い日本語の文字列）
- description: 提案の詳細説明（日本語の文字列）
- potentialSavings: 削減できる見込み金額（円、数値。わからない場合は省略可）

例:
[
  { "title": "...", "description": "...", "potentialSavings": 1000 }
]

JSON 配列以外の文字列（説明文やマークダウンの装飾）は一切含めないでください。`
}
