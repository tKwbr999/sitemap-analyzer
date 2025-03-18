# ウェブサイトスクリーンショット収集システム シーケンス図

## クロールプロセスのシーケンス図

```mermaid
sequenceDiagram
    actor User
    participant Main as index.ts
    participant Config as ConfigLoader
    participant Crawler as WebsiteCrawler
    participant BrowserMgr as BrowserManager
    participant PageProc as PageProcessor
    participant PathUtils as ScreenshotPathUtils
    participant Utils as UrlUtils/FileUtils
    participant Browser as Puppeteer

    User->>Main: npm run crawl [configType] [baseUrl]
    activate Main
    Main->>Config: getConfig(configType, baseUrl)
    activate Config
    Config-->>Main: config: CrawlConfig
    deactivate Config
    
    Main->>Crawler: new WebsiteCrawler(config)
    activate Crawler
    Crawler->>Utils: getDomainDirFromUrl(config.baseUrl)
    activate Utils
    Utils-->>Crawler: domainName
    deactivate Utils
    
    Crawler->>Utils: createDirectory(outputDir)
    activate Utils
    Utils-->>Crawler: directories created
    deactivate Utils
    
    Crawler->>BrowserMgr: new BrowserManager()
    Crawler->>PageProc: new PageProcessor(browserManager)
    
    Main->>Crawler: crawl()
    
    Crawler->>BrowserMgr: initialize()
    activate BrowserMgr
    BrowserMgr->>Browser: puppeteer.launch()
    activate Browser
    Browser-->>BrowserMgr: browser instance
    deactivate Browser
    BrowserMgr-->>Crawler: initialization complete
    deactivate BrowserMgr
    
    Crawler->>Crawler: pageQueue.push({url: baseUrl, depth: 0})
    
    loop Until queue empty or maxPages reached
        Crawler->>Crawler: get next URL from pageQueue
        
        alt URL not visited
            Crawler->>PageProc: processUrl(url, depth, outputDir, devices, includePatterns, excludePatterns)
            activate PageProc
            
            loop For each device
                PageProc->>BrowserMgr: createPage()
                activate BrowserMgr
                BrowserMgr->>Browser: browser.newPage()
                activate Browser
                Browser-->>BrowserMgr: page
                deactivate Browser
                BrowserMgr-->>PageProc: page
                deactivate BrowserMgr
                
                PageProc->>BrowserMgr: configurePageForDevice(page, device)
                activate BrowserMgr
                BrowserMgr->>Browser: page.setViewport()
                activate Browser
                Browser-->>BrowserMgr: viewport set
                BrowserMgr->>Browser: page.setUserAgent()
                Browser-->>BrowserMgr: userAgent set
                deactivate Browser
                BrowserMgr-->>PageProc: device configured
                deactivate BrowserMgr
                
                PageProc->>Browser: page.goto(url)
                activate Browser
                Browser-->>PageProc: page loaded
                deactivate Browser
                
                PageProc->>Browser: page.title()
                activate Browser
                Browser-->>PageProc: page title
                deactivate Browser
                
                PageProc->>PathUtils: createScreenshotPath(outputDir, url)
                activate PathUtils
                PathUtils->>PathUtils: パスをディレクトリ構造に変換
                PathUtils-->>PageProc: screenshotDir
                deactivate PathUtils
                
                PageProc->>Utils: fs.mkdirSync(screenshotDir, {recursive: true})
                activate Utils
                Utils-->>PageProc: directory created
                deactivate Utils
                
                PageProc->>Browser: page.screenshot({path: screenshotDir/deviceName.png, fullPage: true})
                activate Browser
                Browser-->>PageProc: screenshot saved
                deactivate Browser
                
                alt depth < maxDepth
                    PageProc->>PageProc: extractLinks(page, url, includePatterns, excludePatterns)
                    PageProc->>Browser: page.evaluate(extractAnchors)
                    activate Browser
                    Browser-->>PageProc: raw links
                    deactivate Browser
                    
                    PageProc->>Utils: filter and process links
                    activate Utils
                    Utils-->>PageProc: filtered links
                    deactivate Utils
                end
                
                PageProc->>Browser: page.close()
                activate Browser
                Browser-->>PageProc: page closed
                deactivate Browser
            end
            
            PageProc-->>Crawler: pageInfo
            deactivate PageProc
            
            Crawler->>Crawler: pageInfos.push(pageInfo)
            Crawler->>Crawler: visitedUrls.add(url)
            
            alt depth < maxDepth
                Crawler->>Crawler: add links to pageQueue
            end
            
            Crawler->>Utils: sleep(delay)
            activate Utils
            Utils-->>Crawler: sleep completed
            deactivate Utils
        end
    end
    
    Crawler->>Crawler: generateSitemap()
    Crawler->>Utils: writeJsonToFile(outputDir/sitemap.json, pageInfos)
    activate Utils
    Utils-->>Crawler: sitemap saved
    deactivate Utils
    
    Crawler->>BrowserMgr: close()
    activate BrowserMgr
    BrowserMgr->>Browser: browser.close()
    activate Browser
    Browser-->>BrowserMgr: browser closed
    deactivate Browser
    BrowserMgr-->>Crawler: browser closed
    deactivate BrowserMgr
    
    Crawler-->>Main: crawl completed
    deactivate Crawler
    Main-->>User: "クロール完了"
    deactivate Main
```

## スクリーンショットパス生成フロー

```mermaid
sequenceDiagram
    participant PageProc as PageProcessor
    participant PathUtils as ScreenshotPathUtils
    participant Utils as FileUtils
    participant Browser as Puppeteer

    PageProc->>PathUtils: createScreenshotPath(outputDir, url)
    activate PathUtils
    PathUtils->>PathUtils: URLをパース
    PathUtils->>PathUtils: ホスト名を抽出して変換 (. -> -)
    PathUtils->>PathUtils: パスを正規化してセグメントに分割
    PathUtils->>PathUtils: セグメントを安全な文字列に変換
    
    alt パスがない場合
        PathUtils-->>PageProc: outputDir/hostname
    else パスがある場合
        PathUtils-->>PageProc: outputDir/hostname/segment1/segment2/...
    end
    deactivate PathUtils
    
    PageProc->>Utils: fs.mkdirSync(screenshotDir, {recursive: true})
    activate Utils
    Utils-->>PageProc: ディレクトリ作成完了
    deactivate Utils
    
    PageProc->>Browser: デバイスに応じた名前を生成 (desktop -> pc, smartphone -> sp)
    
    PageProc->>Browser: page.screenshot({path: `${screenshotDir}/${deviceName}.png`, fullPage: true})
    activate Browser
    Browser-->>PageProc: スクリーンショット保存完了
    deactivate Browser
```

## 分析プロセスのシーケンス図

```mermaid
sequenceDiagram
    actor User
    participant Main as analyze.ts
    participant Analyzer as SitemapAnalyzer
    participant Utils as FileUtils
    
    User->>Main: npm run analyze [sitemapPath]
    activate Main
    Main->>Main: parseCommandLineArgs()
    
    Main->>Analyzer: new SitemapAnalyzer(sitemapPath)
    activate Analyzer
    
    Main->>Analyzer: loadSitemap()
    Analyzer->>Utils: readJsonFromFile(sitemapPath)
    activate Utils
    Utils-->>Analyzer: pageInfos
    deactivate Utils
    
    Main->>Analyzer: saveAnalysis(analysisOutputPath)
    Analyzer->>Analyzer: analyze()
    Analyzer->>Utils: writeJsonToFile(analysisOutputPath, analysis)
    activate Utils
    Utils-->>Analyzer: analysis saved
    deactivate Utils
    
    Main->>Analyzer: generateReport(reportOutputPath)
    Analyzer->>Analyzer: analyze()
    Analyzer->>Analyzer: generate report markdown
    Analyzer->>Utils: writeTextToFile(reportOutputPath, report)
    activate Utils
    Utils-->>Analyzer: report saved
    deactivate Utils
    
    Analyzer-->>Main: Analysis completed
    deactivate Analyzer
    
    Main-->>User: "分析が完了しました"
    deactivate Main
```

## スクリーンショット保存ディレクトリ構造

### 更新後のディレクトリ構造

```
[outputDir]/
├── www-airbnb-jp/
│   ├── pc.png      # トップページのdesktopスクリーンショット
│   ├── sp.png      # トップページのsmartphoneスクリーンショット
│   ├── canmore-canada/
│   │   └── stays/
│   │       └── pet-friendly/
│   │           ├── pc.png  # desktopスクリーンショット
│   │           └── sp.png  # smartphoneスクリーンショット
│   └── benalmadena-spain/
│       └── stays/
│           └── houses/
│               ├── pc.png  # desktopスクリーンショット
│               └── sp.png  # smartphoneスクリーンショット
└── sitemap.json  # クロール結果のサイトマップ
```

## 全体的なワークフローの概要

1. **クロールプロセス**:
   - ユーザーがコマンドを実行
   - 設定を読み込み
   - WebsiteCrawlerがインスタンス化され、クロール開始
   - ブラウザが初期化され、各ページにアクセス
   - 各デバイスごとにURLパスに基づいたディレクトリ構造でスクリーンショットを撮影
   - リンクを抽出し、次のクロール対象をキューに追加
   - すべてのページを処理後、サイトマップJSONを生成
   - ブラウザを閉じて完了

2. **分析プロセス**:
   - ユーザーが分析コマンドを実行
   - サイトマップJSONを読み込み
   - サイト構造を分析
   - 分析結果をJSONとして保存
   - 人間が読みやすいMarkdownレポートを生成
   - 完了を通知
