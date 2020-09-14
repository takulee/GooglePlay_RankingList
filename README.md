# GooglePlay_RankingList
Puppeteer: GooglePlayのランキングページを元に、ランキング一覧(CSV)を作成する

Google Playのランキング情報をPuppeteerを使ってCSVファイル化します。
出力する情報は、以下の6つです。

- アプリ名
- 提供元
- カテゴリー
- 更新日
- バージョン
- Google Playのアプリのページ(URL)

CSVファイルの文字コードはUTF-8ですので、そのままExcelで開くと文字化けしますのでお気を付けください。
また、自分用に作ったので、エラー処理などはほぼ無いです。
