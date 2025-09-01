// レシートプリンター用スクリプト
const isCorrectBrowserUsed = window.navigator.userAgent.startsWith("StarWebPRNTBrowser");
let isPrinterDetected = false;

if (!isCorrectBrowserUsed) {
    console.warn("Star Web PRNT Browserを利用していません。");
    // TODO: 自動的に店員操作モードにする
}