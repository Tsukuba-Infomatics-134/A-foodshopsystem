// レシートプリンター用スクリプト
const isCorrectBrowserUsed = window.navigator.userAgent.startsWith("StarWebPRNTBrowser");
const printURL = "http://localhost:8001/StarWebPRNT/SendMessage";
let isPrinterDetected = false;

if (!isCorrectBrowserUsed) {
    console.warn("Star Web PRNT Browserを利用していません。");
    // TODO: 自動的に店員操作モードにする
}

function receipt_print(order_id, password) {
    // TODO: 印刷
    if (!isCorrectBrowserUsed) return;
}

function receipt_checkPrinterCondition() {
    if (!isCorrectBrowserUsed) return false;
    return false;
}
