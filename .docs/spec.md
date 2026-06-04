# パーソナルピラティスGYMFIT LP 仕様書・引き継ぎ書

作成日：2026-06-05  
作成者：yamamoto1994

---

## 1. システム概要

マシンピラティス体験レッスンの集客LP。Google広告からの流入を想定。  
フォーム送信・LINE問い合わせを受け付け、Chatwork・メール・スプレッドシートに通知・記録する。

---

## 2. URL一覧

| 用途 | URL |
|------|-----|
| LP本番 | https://gymfit-lp-production.up.railway.app/ |
| プライバシーポリシー | https://gymfit-lp-production.up.railway.app/privacy.html |
| 特定商取引法 | https://gymfit-lp-production.up.railway.app/tokusho.html |
| 送信完了ページ | https://gymfit-lp-production.up.railway.app/thanks.html |
| GitHub | https://github.com/yamamoto1994/gymfit-lp |
| お問い合わせスプシ | https://docs.google.com/spreadsheets/d/1XG92LORkuQ4ITw1fKb_sOyrq1LsSJYEfghaGHjRnoCs/edit |
| GA4イベント一覧スプシ | https://docs.google.com/spreadsheets/d/1s4qYuAUkw6GYtALOeSPJcuewhwZMkU1-XnntA5i0us4/edit |
| LINE公式アカウント | https://lin.ee/55ZGd8P |
| Coubic予約 | https://coubic.com/bakutore |
| Instagram | https://www.instagram.com/bakutore.shinjukuedogawabashi |

---

## 3. インフラ構成

```
[ブラウザ]
    ↓
[Railway] server.js（Node.js + Express）
    ├── 静的ファイル配信（index.html等）
    ├── POST /notify → Chatwork通知（フォーム送信時）
    └── POST /line-webhook → Chatwork通知（LINE受信時）

[フォーム送信時の処理フロー]
    1. ブラウザ → POST /notify → Chatwork（ルームID: 437477390）
    2. ブラウザ → POST GAS Web App → スプシ転記 + 自動返信メール + 管理者通知メール
    3. ブラウザ → POST FormSubmit → バックアップメール（gymfit.zaitou@gmail.com）
    4. thanks.html にリダイレクト
```

---

## 4. デプロイ方法

GitHubのmasterブランチにpushすると**Railwayが自動デプロイ**（約2〜3分）。

```bash
git add .
git commit -m "変更内容"
git push origin master
```

---

## 5. 外部サービス・認証情報

### Chatwork
| 項目 | 値 |
|------|----|
| API Token | server.js内 `CW_TOKEN` を参照 |
| フォーム通知ルームID | 437477390 |
| LINE通知ルームID | 438563623 |

### Google Apps Script（GAS）
| 項目 | 値 |
|------|----|
| Web App URL | https://script.google.com/macros/s/AKfycbw7aUYrPpPVv3tMSzPYdyreardRMWrntQWaV6pPnNv7UazXJfcVhiMUvg4H4gGdxx7a-w/exec |
| オーナー | gymfit.zaitou@gmail.com |
| 処理内容 | スプシ転記・自動返信メール送信・管理者通知メール送信 |

### Google Analytics
| 項目 | 値 |
|------|----|
| 測定ID | G-HXC8N9WLY9 |
| アカウント | gymfit.zaitou@gmail.com |
| キーイベント | form_submit |

### LINE Webhook
| 項目 | 値 |
|------|----|
| Webhook URL | https://gymfit-lp-production.up.railway.app/line-webhook |
| 設定場所 | LINE Official Account Manager → 設定 → Messaging API |

### FormSubmit（バックアップメール）
| 項目 | 値 |
|------|----|
| 送信先 | gymfit.zaitou@gmail.com |

---

## 6. ファイル構成

```
/
├── index.html        # メインLP
├── thanks.html       # 送信完了ページ
├── privacy.html      # プライバシーポリシー
├── tokusho.html      # 特定商取引法に基づく表記
├── server.js         # Node.jsサーバー
├── package.json
├── style.css
├── img/              # 画像ファイル
└── .docs/
    ├── spec.md       # 本ファイル
    └── link.md       # リンク一覧
```

---

## 7. GA4計測イベント一覧

| イベント名 | 種別 | 内容 | パラメータ |
|-----------|------|------|-----------|
| page_view | 自動 | ページ表示 | - |
| scroll | 自動 | 90%スクロール到達 | - |
| user_engagement | 自動 | 滞在・操作 | - |
| session_start | 自動 | セッション開始 | - |
| first_visit | 自動 | 初回訪問 | - |
| form_start | 自動 | フォーム入力開始 | - |
| form_submit | カスタム・キーイベント | フォーム送信完了 | form_name: contact |
| click_line | カスタム | LINEボタンクリック | section: fv/studio/price, device: pc/sp |
| click_contact | カスタム | お問い合わせボタンクリック | section: fv/header/target, device: pc/sp |
| click_map | カスタム | Googleマップボタンクリック | device: pc |

---

## 8. 事業者情報

| 項目 | 内容 |
|------|------|
| 法人名 | 株式会社カマルド |
| 代表者 | 山本紘希 |
| 住所 | 〒162-0041 東京都新宿区早稲田鶴巻町573−5 |
| 電話 | 090-6378-6510 |
| メール | gymfit.zaitou@gmail.com |

---

## 9. 広告運用時の注意事項

### UTMパラメータ
広告のリンク先URLには必ずUTMパラメータを付ける。
```
https://gymfit-lp-production.up.railway.app/?utm_source=google&utm_medium=cpc&utm_campaign=キャンペーン名
```

### GA4コンバージョン
`form_submit` をキーイベントとして設定済み。Google広告と連携する場合はGA4からインポートする。

---

## 10. GASスクリプトのメンテナンス

GASを更新する場合は `gymfit.zaitou@gmail.com` でログインして以下から編集：
- https://script.google.com にアクセス → 該当プロジェクトを開く
- 編集後：デプロイ → デプロイを管理 → バージョンを更新して保存
- Web App URLは変わらないのでindex.htmlの変更は不要

---

## 11. よくあるトラブルと対処法

| 症状 | 原因 | 対処 |
|------|------|------|
| Chatwork通知が来ない | サーバーエラーまたはAPIトークン失効 | Railwayのログを確認 |
| 自動返信メールが来ない | GASのMailApp権限切れ | GASでtestEmail()を実行して再認証 |
| スプシに転記されない | GAS Web AppのURL変更 | index.htmlのGAS_URLを確認 |
| LINEからChatworkに通知が来ない | Webhook URLの設定ミス | LINE Official Account Managerで確認 |
| デプロイが反映されない | Railway自動デプロイの遅延 | 2〜3分待ってから確認 |
