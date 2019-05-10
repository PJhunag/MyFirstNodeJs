
var request = require("request");
var cheerio = require("cheerio");
var mysql = require('mysql');

//建立連線
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'stock',
    insecureAuth: true
});

//撈出所有有紀錄的股票
var ls_sql = "select distinct(name001) from stock.name_t where  " +
    " (name001 like '0%' or  " +
    " name001 like '1%' or  " +
    " name001 like '2%' or  " +
    " name001 like '3%' or  " +
    " name001 like '4%' or  " +
    " name001 like '5%' or  " +
    " name001 like '6%' or  " +
    " name001 like '7%' or  " +
    " name001 like '8%' or  " +
    " name001 like '9%' ) and length(name001) = 4 and "+
    " name001 not in (select divd001 from divd_t)"
console.log(ls_sql);
connection.query(ls_sql, async function (error, rows) {
    //檢查是否有錯誤
    if (error) {
        throw error;
    }
    else {
        for (i = 0; i < 1; i++) {
            var url = "https://goodinfo.tw/StockInfo/StockDividendSchedule.asp?STOCK_ID=" + rows[i].name001

            console.log("網址: " + url);
            var obj = { id: rows[i].name001 };

            headers = { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_2 like Mac OS X) App leWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53' }
            request({
                url: url,
                method: "GET",
                headers: headers
            },
                async function (error, response, body) {
                    if (error || !body) {
                        console.log("沒有抓到資料: " + url);
                    }
                    else {
                        const doc = cheerio.load(body);
                        const table_tr = doc(".solid_1_padding_4_3_tbl tr");

                        var lr_divd = { divd001: "", divd002: "", divd003: "", divd004: "", divd005: "", divd006: "" }
                        for (let j = 1; j < table_tr.length; j++) { // 走訪 tr

                            const table_td = table_tr.eq(j).find('td'); // 擷取每個欄位(td)
                            lr_divd.divd001 = rows[i].name001;        //股票代碼
                            lr_divd.divd002 = table_td.eq(1).text();  //股利發放年度
                            lr_divd.divd003 = table_td.eq(3).text();  //除息交易日
                            lr_divd.divd004 = table_td.eq(4).text();  //除息參考價(元)
                            lr_divd.divd005 = table_td.eq(15).text(); //平均股價
                            lr_divd.divd006 = table_td.eq(16).text(); //殖利率

                            await setDivd(lr_divd);
                        }
                    }
                });

            await delay(60000);
        }
    }
});

const delay = (interval) => {
    return new Promise((resolve) => {
        setTimeout(resolve, interval);
    });
};

async function setDivd(lr_divd) {

    if (lr_divd.divd002 > 2000) {

        console.log("------------------------------------")
        console.log("股票代碼      :" + lr_divd.divd001)
        console.log("股利發放年度  :" + lr_divd.divd002)
        console.log("除息交易日    :" + lr_divd.divd003)
        console.log("除息參考價(元):" + lr_divd.divd004)
        console.log("平均股價      :" + lr_divd.divd005)
        console.log("殖利率        :" + lr_divd.divd006)

        var ls_ins_sql = "INSERT INTO stock.divd_t (divd001,divd002,divd003,divd004,divd005,divd006) VALUES  "+
                         "("+
                         "'"+lr_divd.divd001+"',"+
                         "'"+lr_divd.divd002+"',"+
                         "'"+lr_divd.divd003+"',"+
                         "'"+lr_divd.divd004+"',"+
                         "'"+lr_divd.divd005+"',"+
                         "'"+lr_divd.divd006+"'"+
                         ")"
                         console.log(ls_ins_sql)
        await connection.query(ls_ins_sql, lr_divd, function (error) {
            if (error) {
                console.log('寫入資料失敗:'+error);
            }
            else {
                console.log('寫入資料成功！');
            }
        });
    }
}
























