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


function _getYenText(price, withSpace=true) {
    // 3桁・4桁円しか想定されないため、それに合わせた金額表示を行う。3桁円の場合は空白2個が先頭に含まれる
    let price_str = withSpace ? `  \\${price}` : `\\${price}`;
    if (price >= 1000) {
        const mod = ('000' + (price % 1000)).slice(-3);
        price_str = `\\${Math.floor(price/1000)},${mod}`;  // 1000円以上のときはカンマを付ける
    }
    return price_str
}


function _getReceiptStringLength(text) {
    let ret = 0;
    for(let i in text) {
        // 全角半角判定の正規表現
        if (i.match(/[ -~]/)) {
            ret += 1
        } else {
            ret += 2
        }
    }
    return ret;
}


function _getMobileURL(order_id, password) {
    return `https://api.yaakiyu.f5.si/M/${order_id}/${password}`;
}


function _makeReceiptProductsLine(builder, class_number, item_id, count) {
    const item_index = item_id == "item_1" ? 0 : 1;
    const titleData = [
        "ベビーカステラ(プレーン)  ",
        "ベビーカステラ(抹茶)  ",
        "お好み焼き(豚玉)  ",
        "お好み焼き(豚玉チーズ)  ",
        "みたらしきなこ団子  ",
        "カラフルあんこ団子  ",
        "かき氷(抹茶白玉小豆)  ",
        "かき氷(マンゴー)  ",
        "ポテト(コンソメ)  ",
        "ポテト(バター醤油)  ",
        "たこ焼き(ソース)  ",
        "たこ焼き(明太もち)  ",
    ];
    let ret = builder.createAlignmentElement({position:'left'});
    const itemname = titleData[(class_number - 1) * 2 + item_index];
    ret += builder.createTextElement({data:itemname});
    const price = priceData[class_number-1][item_index];
    let price_str = `${count}個  ${_getYenText(price*count)}`
    if (_getReceiptStringLength(itemname + price_str) > 32) {
        // 2行に分ける
        ret += builder.createTextElement({data:"\n"})
    }
    ret += builder.createAlignmentElement({position:'right'});
    ret += builder.createTextElement({data:price_str + '\n'});
    return [ret, price*count]
}


/***********************************************************/
/* print a sample receipt using API in StarWebPrintBuilder */
/***********************************************************/
function _onSendMessageApi(data) {
    // normalもemphasisも '123456789012345678901234567\n' 27文字
    const builder = new StarWebPrintBuilder();

    let request = '';
    let total_price = 0;

    request += builder.createInitializationElement();

    request += builder.createTextElement({characterspace:0, international:'japan'});

    request += builder.createAlignmentElement({position:'right'});
    request += builder.createLogoElement({number:1});
    request += builder.createTextElement({data:'TOIN FESTIVAL 2025\n'});
    request += builder.createTextElement({data:'\n'});
    request += builder.createAlignmentElement({position:'left'});
    request += builder.createTextElement({data:"ご利用ありがとうございます。\n"});
    request += builder.createTextElement({data:'\n'});

    const item_1_data = _makeReceiptProductsLine(builder, data["class_number"], "item_1", data["item_1"]);
    request += item_1_data[0];
    total_price += item_1_data[1];
    const item_2_data = _makeReceiptProductsLine(builder, data["class_number"], "item_2", data["item_2"]);
    request += item_2_data[0];
    total_price += item_2_data[1];
    request += builder.createAlignmentElement({position:'left'});
    request += builder.createTextElement({underline:true, data:'                                \n'});
    request += builder.createTextElement({underline:false});

    request += builder.createTextElement({width:2, data:'合計'});
    request += builder.createAlignmentElement({position:'right'});
    request += builder.createTextElement({width:2, data:`${_getYenText(total_price)}\n`});
    request += builder.createTextElement({width:1});

    request += builder.createAlignmentElement({position:'left'});
    request += builder.createTextElement({underline:true, data:'                                \n'});
    request += builder.createTextElement({underline:false});

    request += builder.createAlignmentElement({position:'center'});
    request += builder.createTextElement({data:"整理番号"});

    request += builder.createAlignmentElement({position:'right'});
    request += builder.createQrCodeElement({data:_getMobileURL(data["order_id"], data["password"])});
    request += builder.createTextElement({data:"\n"});
    
    request += builder.createAlignmentElement({position:'center'});
    request += builder.createTextElement({width:2, emphasis:true, data: `${data["order_id"]}\n`})
    request += builder.createTextElement({width:1, emphasis:false});

    request += builder.createTextElement({data:'発行：2025/09/03 10:05\n\n\n'});

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

