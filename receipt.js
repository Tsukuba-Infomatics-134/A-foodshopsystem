// レシートプリンター用スクリプト
const isCorrectBrowserUsed = window.navigator.userAgent.startsWith("StarWebPRNTBrowser");
const printURL = "http://localhost:8001/StarWebPRNT/SendMessage";
let isPrinterDetected = false;

if (!isCorrectBrowserUsed) {
    console.warn("Star Web PRNT Browserを利用していません。");
    // TODO: 自動的に店員操作モードにする
}

function receipt_print(order_id, password, data) {
    // TODO: 印刷
    if (!isCorrectBrowserUsed) {
        alert("印刷に対応していないブラウザです。");
        return;
    }
    if (!receipt_checkPrinterCondition()) {
        alert("レシートプリンターと接続されていません。");
        return;
    }
    console.log("印刷します。");
    _onSendMessageApi(order_id, password, data);
}

function receipt_checkPrinterCondition() {
    if (!isCorrectBrowserUsed) return false;
    return false;
}


function _makeReceiptProductOneLine(item_index, number) {}


/***********************************************************/
/* print a sample receipt using API in StarWebPrintBuilder */
/***********************************************************/
function _onSendMessageApi(order_id, password, data) {
    // normalもemphasisも '123456789012345678901234567\n' 27文字
    const builder = new StarWebPrintBuilder();

    let request = '';

    request += builder.createInitializationElement();

    request += builder.createTextElement({characterspace:2});

    request += builder.createAlignmentElement({position:'right'});
    request += builder.createLogoElement({number:1});
    request += builder.createTextElement({data:'TOIN FESTIVAL 2025\n'});
    request += builder.createAlignmentElement({position:'left'});

    request += builder.createTextElement({data:'\n'});

    request += builder.createAlignmentElement({position:'center'});
    request += builder.createTextElement({data:"またのご利用をお待ちしております。\n"});
    request += builder.createAlignmentElement({position:'left'});

    request += builder.createTextElement({data:'\n'});

    request += builder.createTextElement({data:`Apple                $20.00\n`});
    request += builder.createTextElement({underline:true, data:'Tax                  $10.00\n'});
    request += builder.createTextElement({underline:false});
    request += builder.createTextElement({emphasis:true});
    request += builder.createTextElement({width:2, data:'Total'});
    request += builder.createTextElement({width:1, data:'   '});
    request += builder.createTextElement({width:2, data:'$210.00\n'});
    request += builder.createTextElement({width:1});
    request += builder.createTextElement({emphasis:false});

    request += builder.createTextElement({data:'\n'});

    request += builder.createTextElement({data:'Received            $300.00\n'});

    request += builder.createTextElement({width:2, data:'Change'});
    request += builder.createTextElement({width:1, data:'   '});
    request += builder.createTextElement({width:2, data:'$90.00\n'});
    request += builder.createTextElement({width:1});
    request += builder.createTextElement({data:'\n'});

    request += builder.createTextElement({characterspace:0});

    request += builder.createFeedElement({line:1});

    _sendMessageApi(request);
}


function _sendMessageApi(request) {
    const url = printURL;

    const trader = new StarWebPrintTrader({url:url});

    trader.onReceive = (response) => {
        let msg = '- onReceive -\n\n';
        msg += 'TraderSuccess : [ ' + response.traderSuccess + ' ]\n';
//      msg += 'TraderCode : [ ' + response.traderCode + ' ]\n';
        msg += 'TraderStatus : [ ' + response.traderStatus + ',\n';

        if (trader.isCoverOpen            ({traderStatus:response.traderStatus})) {msg += '\tCoverOpen,\n';}
        if (trader.isOffLine              ({traderStatus:response.traderStatus})) {msg += '\tOffLine,\n';}
        if (trader.isCompulsionSwitchClose({traderStatus:response.traderStatus})) {msg += '\tCompulsionSwitchClose,\n';}
        if (trader.isEtbCommandExecute    ({traderStatus:response.traderStatus})) {msg += '\tEtbCommandExecute,\n';}
        if (trader.isHighTemperatureStop  ({traderStatus:response.traderStatus})) {msg += '\tHighTemperatureStop,\n';}
        if (trader.isNonRecoverableError  ({traderStatus:response.traderStatus})) {msg += '\tNonRecoverableError,\n';}
        if (trader.isAutoCutterError      ({traderStatus:response.traderStatus})) {msg += '\tAutoCutterError,\n';}
        if (trader.isBlackMarkError       ({traderStatus:response.traderStatus})) {msg += '\tBlackMarkError,\n';}
        if (trader.isPaperEnd             ({traderStatus:response.traderStatus})) {msg += '\tPaperEnd,\n';}
        if (trader.isPaperNearEnd         ({traderStatus:response.traderStatus})) {msg += '\tPaperNearEnd,\n';}
        if (trader.isPaperPresent         ({traderStatus:response.traderStatus})) {msg += '\tPaperPresent,\n';}
        if (trader.isRollPositionError    ({traderStatus:response.traderStatus})) {msg += '\tRollPositionError,\n';}

        msg += '\tEtbCounter = ' + trader.extractionEtbCounter({traderStatus:response.traderStatus}).toString() + ' ]\n';
//      msg += 'Status : [ ' + response.status + ' ]\n';
//      msg += 'ResponseText : [ ' + response.responseText + ' ]\n';

        alert(msg);
    }

    trader.onError = (response) => {
        let msg = '- onError -\n\n';
        msg += '\tStatus:' + response.status + '\n';
        msg += '\tResponseText:' + response.responseText;

        alert(msg);
    }

    trader.sendMessage({request:request});
}

