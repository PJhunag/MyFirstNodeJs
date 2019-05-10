//載入所需模組
var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var port = process.env.PORT || 8080;
var cors = require('cors')
var CryptoJS = require("crypto-js");
var mysql = require('mysql');

//建立server連線
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//建立連線
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'stock',
    insecureAuth: true
});

//開始連接
connection.connect();

//router.get('/getPrice/:id/:date', getStockPrice); //取得股票價格
//router.get('/getDean/:id/:date', getStockDean); //取得股票成交量
//router.get('/getStock/list', getStockList); //取得股票清單
//router.post('/getPrices/:date', getStockPrices); //取得股票價格
//router.get('/getNpercent/:percent', getStockPercentUp); //取得當天成交量N%以上的股票
//router.get('/getRangePrices/:id/:sdate/:edate', getRangePrices); //取得一定時間區間的股價清單

app.get('/getPrice/:id/:date', function (request, response) { //取得股票價格

    console.log("Request:getStockPrice");

    var id = request.params.id;
    var date = request.params.date;
    console.log("查詢代碼:" + id);
    console.log("日期:" + date);

    response.writeHead(201, { 'Content-Type': 'text/plain' });

    //取得價格
    var ls_twse007;
    ls_twse007 = connection.query("SELECT twse007 FROM stock.twse_t WHERE twse001 = '" + id + "' AND twse002='" + date + "'", function (error, rows, fields) {
        //檢查是否有錯誤
        if (error) {
            throw error;
            response.end(error);
        }
        else {
            console.log('2330: ' + rows[0].twse007);
            price = rows[0].twse007;
            var j_json = { "id": id, "date": date, "c_prise": price };    // 一個物件
            var s_json = JSON.stringify(j_json);    // 字串化

            response.end(s_json);
        }
    });
})

app.get('/getDean/:id/:date', function (request, response) { //取得股票成交量
    console.log("Request:getStockDean");
    var id = request.params.id;
    var date = request.params.date;
    console.log("查詢代碼:" + id);
    console.log("日期:" + date);

    response.writeHead(201, { 'Content-Type': 'text/plain' });

    //連線測試
    var ls_twse003;
    ls_twse003 = connection.query("SELECT twse003 FROM stock.twse_t WHERE twse001 = '" + id + "' AND twse002='" + date + "'", function (error, rows, fields) {
        //檢查是否有錯誤
        if (error) {
            throw error;
            response.end(error);
        }
        else {
            dean = rows[0].twse003;
            var j_json = { "id": id, "date": date, "c_dean": dean };    // 一個物件
            var s_json = JSON.stringify(j_json);    // 字串化
            response.end(s_json);
        }
    });
})

app.get('/getStock/list/:wc', function (request, response) { //取得股票清單
    console.log("Request:getStockList");

    var ls_wc = request.params.wc;
    response.writeHead(200, { 'Content-Type': 'text/html' });
    //response.write('<head><meta charset="utf-8"/></head>');

    var ls_tws003;
    var ls_sql = "SELECT DISTINCT twse001,name003 FROM stock.twse_t LEFT JOIN stock.name_t ON twse001 = name001 "
    if (ls_wc != "ALL") {
        ls_sql = ls_sql + " WHERE twse001 LIKE '" + ls_wc + "%' Limit 50"
    }
    else {
        ls_sql = ls_sql + " Limit 50"
    }

    ls_twse003 = connection.query(ls_sql, function (error, rows, fields) {
        //檢查是否有錯誤
        if (error) {
            throw error;
            response.end(error);
        }
        else {
            var list = [];
            for (i = 0; i < rows.length; i++) {
                stock_id = rows[i].twse001;
                stock_name = rows[i].name003;
                list.push({ id: stock_id, name: stock_name });
            }
            var s_json = JSON.stringify(list);    // 字串化

            response.end(s_json);
        }
    });
})

app.get('/getPrices/:date', function (request, response) { //取得股票價格
    console.log("Request:getStockPrices");
    var body = request.body;
    var j_body = JSON.parse(body);
    var id_list = ""
    console.log("body:" + body);
    for (i = 0; i < j_body.length; i++) {
        id_list = id_list + "'" + j_body[i].id + "'"
        if (i != j_body.length - 1) {
            id_list = id_list + ","
        }
    }
    console.log("id list:" + id_list)

    var date = request.params.date;
    console.log("日期:" + date);

    response.writeHead(201, { 'Content-Type': 'text/plain' });

    //資料撈取
    connection.query("SELECT twse001,twse007 FROM stock.twse_t WHERE twse001 in (" + id_list + ") AND twse002='" + date + "'", function (error, rows, fields) {
        //檢查是否有錯誤
        if (error) {
            throw error;
            response.end(error);
        }
        else {
            var list = [];
            for (i = 0; i < rows.length; i++) {
                stock_id = rows[i].twse001;
                stock_price = rows[i].twse007;
                list.push({ id: stock_id, price: stock_price });
            }
            var s_json = JSON.stringify(list);    // 字串化
            response.end(s_json);
        }
    });
})

app.get('/getNpercent/:percent', function (request, response) { //取得當天成交量N%以上的股票
    console.log("Request:getStockPercentUp");

    percent = (request.params.percent) / 100;

    console.log("percent:" + percent);

    response.writeHead(201, { 'Content-Type': 'text/plain' });

    var today;
    var yestoday;

    today_src = new Date();
    var tempDate = today_src.getDate();
    yestoday_src = new Date();
    yestoday_src.setDate(tempDate - 1);
    if (yestoday_src.getDay() == 0 || yestoday_src.getDay() == 6) {
        console.log("yestoday day:" + yestoday_src.getDay());
        tempDate = yestoday_src.getDate();;
        yestoday_src.setDate(tempDate - 1);
    }
    if (yestoday_src.getDay() == 0 || yestoday_src.getDay() == 6) {
        console.log("yestoday day:" + yestoday_src.getDay());
        tempDate = yestoday_src.getDate();;
        yestoday_src.setDate(tempDate - 1);
    }

    //取年
    year = today_src.getFullYear()
    //取月
    if ((today_src.getMonth() + 1) < 10)
        mouth = "0" + (today_src.getMonth() + 1)
    else
        mouth = "" + (today_src.getMonth() + 1)
    //取日
    if (today_src.getDate() < 10)
        day = "0" + today_src.getDate()
    else
        day = "" + today_src.getDate()

    today = year + "-" + mouth + "-" + day

    //取年
    year = yestoday_src.getFullYear()
    //取月
    if ((yestoday_src.getMonth() + 1) < 10)
        mouth = "0" + (yestoday_src.getMonth() + 1)
    else
        mouth = "" + (yestoday_src.getMonth() + 1)
    //取日
    if (yestoday_src.getDate() < 10)
        day = "0" + yestoday_src.getDate()
    else
        day = "" + yestoday_src.getDate()

    yestoday = year + "-" + mouth + "-" + day

    console.log("today:" + today);

    console.log("yestoday:" + yestoday);

    var ls_sql = "select t.twse001,name003 from twse_t t,twse_t y " +
        "LEFT JOIN stock.name_t ON twse001 = name001 " +
        "where t.twse001 = y.twse001 " +
        "and t.twse002 = '" + today + "' and y.twse002 = '" + yestoday + "' " +
        "and t.twse003 > y.twse003*" + percent + " and y.twse003 <> 0;"
    console.log("sql:" + ls_sql)
    //資料撈取
    connection.query(ls_sql, function (error, rows, fields) {
        //檢查是否有錯誤
        if (error) {
            throw error;
            response.end(error);
        }
        else {
            var list = [];
            for (i = 0; i < rows.length; i++) {
                stock_id = rows[i].twse001;
                stock_name = rows[i].name003;
                list.push({ id: stock_id, name: stock_name });
            }
            var s_json = JSON.stringify(list);    // 字串化
            response.end(s_json);
        }
    });
})

app.get('/getRangePrices/:id/:sdate/:edate', function (request, response) { //取得一定時間區間的股價清單
    console.log("Request:getRangePrices");

    id = request.params.id;
    sdate = request.params.sdate;
    edate = request.params.edate;

    response.writeHead(201, { 'Content-Type': 'text/plain' });

    //資料撈取
    console.log("SELECT twse002,twse007 FROM stock.twse_t WHERE twse001 = '" + id + "' AND twse002 between '" + sdate + "' and '" + edate + "'");
    connection.query("SELECT twse002,twse007 FROM stock.twse_t WHERE twse001 = '" + id + "' AND twse002 between '" + sdate + "' and '" + edate + "'", function (error, rows, fields) {
        //檢查是否有錯誤
        if (error) {
            throw error;
            response.end(error);
        }
        else {
            var list = { data: [] };
            for (i = 0; i < rows.length; i++) {
                //取年
                year = rows[i].twse002.getFullYear()
                //取月
                if ((rows[i].twse002.getMonth() + 1) < 10)
                    mouth = "0" + (rows[i].twse002.getMonth() + 1)
                else
                    mouth = "" + (rows[i].twse002.getMonth() + 1)
                //取日
                if (rows[i].twse002.getDate() < 10)
                    day = "0" + rows[i].twse002.getDate()
                else
                    day = "" + rows[i].twse002.getDate()
                stock_date = year + "-" + mouth + "-" + day;

                stock_price = rows[i].twse007;
                list.data.push({ date: stock_date, price: stock_price });
            }
            var s_json = JSON.stringify(list);    // 字串化
            response.end(s_json);
        }
    });
})

app.get('/getMaxMinPrices/:id/:sdate/:edate', function (request, response) { //取得一定時間區間的股價最大最小值
    console.log("Request:getRangePrices");

    id = request.params.id;
    sdate = request.params.sdate;
    edate = request.params.edate;

    response.writeHead(201, { 'Content-Type': 'text/plain' });

    //資料撈取
    console.log("SELECT Max(twse007) FROM stock.twse_t WHERE twse001 = '" + id + "' AND twse002 between '" + sdate + "' and '" + edate + "'");
    connection.query("SELECT twse002,twse007 FROM stock.twse_t WHERE twse001 = '" + id + "' AND twse002 between '" + sdate + "' and '" + edate + "'", function (error, rows, fields) {
        //檢查是否有錯誤
        if (error) {
            throw error;
            response.end(error);
        }
        else {
            var list = { data: [] };
            for (i = 0; i < rows.length; i++) {
                //取年
                year = rows[i].twse002.getFullYear()
                //取月
                if ((rows[i].twse002.getMonth() + 1) < 10)
                    mouth = "0" + (rows[i].twse002.getMonth() + 1)
                else
                    mouth = "" + (rows[i].twse002.getMonth() + 1)
                //取日
                if (rows[i].twse002.getDate() < 10)
                    day = "0" + rows[i].twse002.getDate()
                else
                    day = "" + rows[i].twse002.getDate()
                stock_date = year + "-" + mouth + "-" + day;

                stock_price = rows[i].twse007;
                list.data.push({ date: stock_date, price: stock_price });
            }
            var s_json = JSON.stringify(list);    // 字串化
            response.end(s_json);
        }
    });
})

app.get('/getTraceAmount/:id/:sdate/:edate', function (request, response) { //取得一定時間區間的股價交易量
    console.log("Request:getTraceAmount");

    id = request.params.id;
    sdate = request.params.sdate;
    edate = request.params.edate;

    response.writeHead(201, { 'Content-Type': 'text/plain' });

    //資料撈取
    console.log("SELECT twse002,twse003 FROM stock.twse_t WHERE twse001 = '" + id + "' AND twse002 between '" + sdate + "' and '" + edate + "'");
    connection.query("SELECT twse002,twse003 FROM stock.twse_t WHERE twse001 = '" + id + "' AND twse002 between '" + sdate + "' and '" + edate + "'", function (error, rows, fields) {

        //檢查是否有錯誤
        if (error) {
            throw error;
            response.end(error);
        }
        else {
            var list = { data: [] };
            for (i = 0; i < rows.length; i++) {
                //取年
                year = rows[i].twse002.getFullYear()
                //取月
                if ((rows[i].twse002.getMonth() + 1) < 10)
                    mouth = "0" + (rows[i].twse002.getMonth() + 1)
                else
                    mouth = "" + (rows[i].twse002.getMonth() + 1)
                //取日
                if (rows[i].twse002.getDate() < 10)
                    day = "0" + rows[i].twse002.getDate()
                else
                    day = "" + rows[i].twse002.getDate()
                stock_date = year + "-" + mouth + "-" + day;

                trace_amount = rows[i].twse003;
                list.data.push({ date: stock_date, amount: trace_amount });
            }
            var s_json = JSON.stringify(list);    // 字串化
            response.end(s_json);
        }
    });
})

app.post('/register', function (request, response) { //註冊帳號
    console.log("Request:register");

    //取得訊息
    var body = request.body.msg;

    //還原
    var j_body = msgdecoder(body);
    console.log("decode:" + j_body)
    var infos = JSON.parse(j_body);
    console.log("decoded")

    //檢核帳號是否已經存在
    connection.query("SELECT COUNT(1) cnt FROM stock.user_t WHERE user001 = ? ", infos.account, function (error, rows, fields) {
        //檢查是否有錯誤
        var res;
        if (error) {
            throw error;
            res = { "success": false, "msg": "登入失敗，系統忙碌中請稍後再試(1)！" }
            response.end(JSON.stringify(res));
        }
        else {
            if (rows[0].cnt > 0) {
                res = { "success": false, "msg": "此帳號已存在，請重新註冊！" }
                response.end(JSON.stringify(res));
            }
            else {
                console.log("檢核通過, 開始準備寫入註冊資訊!")
            }
        }
    });
    console.log("insert")
    //資料撈取
    var today = new Date();
    var user_info = {
        user001: infos.account,
        user002: infos.password,
        user003: today,
        user004: infos.mail,
        user005: ""
    };

    connection.query("INSERT INTO stock.user_t SET ?", user_info, function (error, rows, fields) {
        //檢查是否有錯誤
        if (error) {
            throw error;
            res = { "success": false, "msg": "登入失敗，系統忙碌中請稍後再試(2)！" }
            response.end(JSON.stringify(res));
        }
        else {
            res = { "success": true, "msg": "註冊成功，請重新登入！" }
            response.end(JSON.stringify(res));
        }
    });

})

app.post('/login', function (request, response) { //註冊帳號
    console.log("Request:login");

    //取得訊息
    var body = request.body.msg;
    console.log("body:" + body)

    //還原
    var j_body = msgdecoder(body);
    var infos = JSON.parse(j_body);

    //檢核帳密是否正確
    var user001 = infos.account;
    var user002 = infos.password;
    var user_info = { "user001": user001, "user002": user002 };
    connection.query("SELECT COUNT(1) cnt FROM stock.user_t WHERE user001 = ? AND user002 = ?", [user001, user002], function (error, rows, fields) {
        //檢查是否有錯誤
        var res;
        if (error) {
            throw error;
            res = { "success": false, "msg": "登入異常！" }
            console.log("1:" + JSON.stringify(res));
            response.end(JSON.stringify(res));
        }
        else {
            console.log("比對數:" + rows[0].cnt)
            if (rows[0].cnt === 1) {
                res = { "success": true, "msg": "登入成功！" }
                console.log("2:" + JSON.stringify(res));
                response.end(JSON.stringify(res));
            }
            else {
                res = { "success": false, "msg": "登入失敗，請重新檢驗帳號或密碼是否錯誤！" }
                console.log("3:" + JSON.stringify(res));
                response.end(JSON.stringify(res));
            }
        }
    });

})

app.post('/setFavorite', function (request, response) { //添加/刪除我的最愛
    console.log("Request:setFavorite");

    //取得訊息
    var infos = request.body;

    //準備寫入或刪除
    var account = infos.account; //帳號
    var stock = infos.stock; //股票代碼
    var action = infos.action; //行為-insert/delete

    console.log(account + ":" + stock + ":" + action)

    var today = new Date()
    var favorite_info = {
        fvrt001: account,
        fvrt002: stock,
        fvrt003: today
    };

    if (action == "insert") {
        connection.query("INSERT INTO stock.fvrt_t SET ?", favorite_info, function (error, rows, fields) {
            //檢查是否有錯誤
            var res;
            if (error) {
                throw error;
                console.log("我的最愛添加異常" + error + "，帳號" + infos.account + "，我的最愛" + stock);
            }
            else {

            }
        });
    }
    else {
        connection.query("DELETE FROM stock.fvrt_t WHERE fvrt001 = ? AND fvrt002 = ?", [account, stock], function (error, rows, fields) {
            //檢查是否有錯誤
            var res;
            if (error) {
                throw error;
                console.log("我的最愛清除異常" + error + "，帳號" + infos.account + "，我的最愛" + stock);
            }
            else {

            }
        });
    }

    response.end();
})

app.post('/getFavorite', function (request, response) { //取得我的最愛清單
    console.log("Request:getFavorite");

    //取得訊息
    var infos = request.body;

    //取得帳號
    var account = infos.account; //帳號

    //取出twse001 代碼,name003 說明,twse007 收盤價,twse008 漲幅,percent 漲幅百分比
    var ls_sql = "SELECT twse001,name003,twse007,twse008,ROUND(twse008/twse007*100,2) percent  FROM stock.twse_t " +
        "INNER JOIN stock.fvrt_t ON fvrt001 = ? AND twse001 = fvrt002 AND twse002 = (select max(twse002) from stock.twse_t) " +
        "LEFT JOIN name_t ON name001 = twse001 AND name002 = 'zh_TW'"

    var list = []
    connection.query(ls_sql, [account], function (error, rows, fields) {
        //檢查是否有錯誤
        if (error) {
            throw error;
            console.log("我的最愛添加異常" + error + "，帳號" + infos.user + "，我的胃愛" + stock);
            response.end();
        }
        else {
            for (var i = 0; i < rows.length; i++) {
                id = rows[i].twse001;
                name = rows[i].name003;
                price = rows[i].twse007;
                fluct = rows[i].twse008;
                percent = rows[i].percent;
                list.push({ id: id, name: name, price: price, fluct: fluct, percent: percent });
            }
            response.end(JSON.stringify(list));
            console.log("getFavorite:success return!")
        }
    });

})

app.post('/chkFavorite', function (request, response) { //確認是否為我的最愛
    console.log("Request:chkFavorite");

    //取得訊息
    var infos = request.body;

    //準備寫入或刪除
    var account = infos.account; //帳號
    var stock = infos.stock; //股票代碼
    console.log("我的最愛檢核，帳號" + account + "股票代碼" + stock)
    //var action = infos.action; //行為-insert/delete/check

    var r_return = "false";

    connection.query("SELECT COUNT(1) cnt FROM stock.fvrt_t WHERE fvrt001 = ? AND fvrt002 = ?", [account, stock], function (error, rows, fields) {
        //檢查是否有錯誤
        var res;
        if (error) {
            throw error;
            console.log("我的最愛檢核異常" + error + "，帳號" + infos.account + "股票代碼" + stock);
        }
        else {
            console.log("我的最愛檢核，帳號" + infos.account + "股票代碼" + stock);
            if (rows[0].cnt == 1) {
                r_return = "true"; //已存在
            }
            console.log("Return:" + r_return)
            response.end(r_return);
        }
    });

})

app.listen(8000)
console.log("Serve run in port 8000!")

//加密用
function msgdecoder(encryptedBase64Str) {

    var CryptoJS = require("crypto-js");
    var keyStr = "ka0132oftreeNode"
    var key = CryptoJS.enc.Utf8.parse(keyStr);

    console.log("encryptedBase64Str:" + encryptedBase64Str)

    // 解密
    var decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    // 解密，需要按照Utf8的方式将明文转位字符串
    var decryptedStr = decryptedData.toString(CryptoJS.enc.Utf8);
    console.log("decryptedStr:" + decryptedStr)

    return decryptedStr;

}

app.get('/google_login', function (request, response) { //以google帳號登入
    console.log("Request:google_login");

    var google_client_id = "448812857469-7bkri2f82fjp8uiohjdidelaat8thgc8.apps.googleusercontent.com";
    var google_secret_id = "t_cHvnpqIW7zz1SYx4FI34ny";
    var google_callback_url = "http://localhost:8000/google_login/callback";

    //組合登入URL
    var google_oauth_url = "https://accounts.google.com/o/oauth2/v2/auth?" +
        //Scope可以參考文件裡各式各樣的scope，可以貼scope url或是個別命名
        "scope=email%20profile&" +
        "redirect_uri=" + google_callback_url + "&" +
        "response_type=code&" +
        "client_id=" + google_client_id;

    //返回登入URL
    response.end(google_oauth_url);

})

app.get('/google_login/callback', function (request, response) { //以google帳號登入(callback)
    console.log("Request:google_login-callback");

    var rtn_url =
        "<!DOCTYPE html>                                                                                        " +
        "<html>                                                                                                 " +
        "<head>                                                                                                 " +
        "    <meta http-equiv='refresh' content='0;url=http://localhost:3000?google_login' />               " +
        "</head>                                                                                                " +
        "<body>                                                                                                 " +
        "wuchi" +
        "</body>                                                                                                " +
        "</html>                                                                                                "

    //拿code換token
    var google_client_id = "448812857469-7bkri2f82fjp8uiohjdidelaat8thgc8.apps.googleusercontent.com";
    var google_secret_id = "t_cHvnpqIW7zz1SYx4FI34ny";
    var google_callback_url = "http://localhost:8000/google_login/callback";
    var google_code = request.query.code;
    console.log("google_client_id:" + google_client_id);
    console.log("google_secret_id:" + google_secret_id);
    console.log("google_callback_url:" + google_callback_url);
    console.log("google_code:" + google_code);

    var token_option = {
        url: "https://www.googleapis.com/oauth2/v4/token",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            code: google_code,
            client_id: google_client_id,
            client_secret: google_secret_id,
            grant_type: "authorization_code",
            //要跟Google Console裡填的一樣喔
            redirect_uri: google_callback_url
        }
    };
    var request = require('request');
    request(token_option, function (err, res, body) {
        var access_token = JSON.parse(body).access_token;
        console.log("access_token:" + access_token)
        var info_option = {
            url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + access_token,
            method: "GET",
        };
        request(info_option, function (err, res, body) {
            var mail = JSON.parse(body).email;
            console.log("email:" + mail)

        })
    })

    response.end(rtn_url);
})

app.get('/facebook_login', function (request, response) { //以facebook帳號登入
    console.log("Request:facebook_login");

    var facebook_client_id = "1129004447267178";
    var facebook_oauth_url = "https://www.facebook.com/dialog/oauth?redirect_uri=" +
        "http://localhost:8000/facebook_login/callback&" +
        "client_id=" + facebook_client_id + "&scope=public_profile&response_type=code";

    //返回登入URL
    response.end(facebook_oauth_url);
})

app.get('/facebook_login/callback', function (request, response) { //以facebook帳號登入(callback)
    console.log("Request:facebook_login-callback");


    var rtn_url =
        "<!DOCTYPE html>                                                                                        " +
        "<html>                                                                                                 " +
        "<head>                                                                                                 " +
        "    <meta http-equiv='refresh' content='5;url=http://localhost:3000?facebook_login' />               " +
        "</head>                                                                                                " +
        "<body>                                                                                                 " +
        "wuchi" +
        "</body>                                                                                                " +
        "</html>                                                                                                "

    //拿code換token
    var facebook_client_id = "448812857469-7bkri2f82fjp8uiohjdidelaat8thgc8.apps.googleusercontent.com";
    var facebook_secret_id = "t_cHvnpqIW7zz1SYx4FI34ny";
    var facebook_callback_url = "http://localhost:8000/google_login/callback";
    var facebook_code = request.query.code;
    console.log("facebook_client_id:" + facebook_client_id);
    console.log("facebook_secret_id:" + facebook_secret_id);
    console.log("facebook_callback_url:" + facebook_callback_url);
    console.log("facebook_code:" + facebook_code);

    response.end(rtn_url);
    /* 
        var token_option = {
            url: "https://www.googleapis.com/oauth2/v4/token",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            form: {
                code: google_code,
                client_id: google_client_id,
                client_secret: google_secret_id,
                grant_type: "authorization_code",
                //要跟Google Console裡填的一樣喔
                redirect_uri: google_callback_url
            }
        };
        var request = require('request');
        request(token_option, function (err, res, body) {
            var access_token = JSON.parse(body).access_token;
            console.log("access_token:"+access_token)
            var info_option = {
                url: "https://www.googleapis.com/oauth2/v1/userinfo?" + "access_token=" + access_token,
                method: "GET",
            };
        }) */


})