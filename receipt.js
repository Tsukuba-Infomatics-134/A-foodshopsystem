// レシートプリンター用スクリプト
const isCorrectBrowserUsed = window.navigator.userAgent.indexOf("StarWebPRNTBrowser") != -1;
const printURL = "http://localhost:8001/StarWebPRNT/SendMessage";
let isPrinterDetected = false;

const priceData = [
    [200, 200], [300, 300], [200, 200],
    [200, 200], [200, 200], [200, 200]
];


if (!isCorrectBrowserUsed) {
    console.warn("Star Web PRNT Browserを利用していません。");
    // TODO: 自動的に店員操作モードにする
}

function receipt_print(data) {
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
    try {
        _onSendMessageApi(data);
    } catch (error) {
        console.error(error);
        alert(error);
    }
}

function receipt_checkPrinterCondition() {
    if (!isCorrectBrowserUsed) return false;
    return true;
}


function _makeReceiptProductsLine(builder, class_number, item_id, count) {
    const item_index = item_id == "item_1" ? 0 : 1;
    const titleData = [
        "ベビーカステラ(プレーン)   \n",
        "ベビーカステラ(抹茶)       \n",
        "お好み焼き(豚玉)           \n",
        "お好み焼き(豚玉チーズ)     \n",
        "みたらしきなこ団子         \n",
        "カラフルあんこ団子         \n",
        "かき氷(抹茶白玉小豆)       \n",
        "かき氷(マンゴー)           \n",
        "ポテト(コンソメ)           \n",
        "ポテト(バター醤油)         \n",
        "たこ焼き(ソース)           \n",
        "たこ焼き(明太もち)         \n",
    ];
    let ret = builder.createAlignmentElement({position:'left'});
    ret += builder.createTextElement({data:titleData[(class_number - 1) * 2 + item_index]});
    const price = priceData[class_number-1][item_index];
    let space = "";
    if (price * count < 1000) {
        space = " ";  // 1000円未満のときは空白の量を調整する
    }
    ret += builder.createAlignmentElement({position:'right'});
    ret += builder.createTextElement({data:`${count}個       ${space}\\${price*count}\n`});
    return [ret, price*count]
}


/***********************************************************/
/* print a sample receipt using API in StarWebPrintBuilder */
/***********************************************************/
function _onSendMessageApi(data) {
    // normalもemphasisも '123456789012345678901234567\n' 27文字
    const builder = new StarWebPrintBuilder();

    let request = '';
    let total_money = 0;

    request += builder.createInitializationElement();

    request += builder.createTextElement({characterspace:0, international:'japan'});

    request += builder.createAlignmentElement({position:'right'});
    request += builder.createLogoElement({number:1});
    request += builder.createTextElement({data:'TOIN FESTIVAL 2025\n'});
    request += builder.createAlignmentElement({position:'left'});

    request += builder.createTextElement({data:'\n'});

    request += builder.createAlignmentElement({position:'center'});
    request += builder.createTextElement({data:"またのご利用をお待ちしております。\n"});

    request += builder.createTextElement({data:'\n'});

    // request += builder.createTextElement({data:`Apple                $20.00\n`});
    const item_1_data = _makeReceiptProductsLine(builder, data["class_number"], "item_1", data["item_1"]);
    request += item_1_data[0];
    total_money += item_1_data[1];
    const item_2_data = _makeReceiptProductsLine(builder, data["class_number"], "item_2", data["item_2"]);
    request += item_2_data[0];
    total_money += item_2_data[1];
    request += builder.createTextElement({underline:true, data:'\n'});
    request += builder.createTextElement({underline:false});
    request += builder.createTextElement({emphasis:true});
    request += builder.createTextElement({width:2, data:'合計'});
    let space = "";
    if (total_money < 1000) {
        space = " ";
    }
    request += builder.createTextElement({width:1, data:'  ' + space});
    request += builder.createTextElement({width:2, data:`\\${total_money}\n`});
    request += builder.createTextElement({width:1});
    request += builder.createTextElement({emphasis:false});

    request += builder.createTextElement({data:'\n'});
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

