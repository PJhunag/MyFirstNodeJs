import React from 'react';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

var url_server = 'http://localhost:8000/'; //server ip

export async function insertFavorite(account, stock_no) {
    console.log('insertFavorite!')

    //呼叫server寫入我的最愛
    var url = url_server + "setFavorite";
    console.log("url:" + url)

    var msg = { account: account, stock: stock_no, action: "insert" };
    //var msg = JSON.stringify(infos) 

    try {
        console.log("start msg:" + msg);
        await axios.post(url, msg);
        console.log("finish");
    }
    catch (e) {
        console.log(e); // Network Error
        console.log(e.status); // undefined
        console.log(e.code); // undefined
    }
}

export async function deleteFavorite(account, stock_no) {
    console.log('deleteFavorite!')

    //呼叫server刪除我的最愛
    var url = url_server + "setFavorite";
    console.log("url:" + url)

    var msg = { account: account, stock: stock_no, action: "delete" };
    //var msg = JSON.stringify(infos)

    try {
        var response = axios.post(url, msg);
    }
    catch (e) {
        console.log(e); // Network Error
        console.log(e.status); // undefined
        console.log(e.code); // undefined
    }
}

export async function checkFavorite(account, stock_no) {
    console.log('checkFavorite!')
    console.log("account:" + account)
    console.log("stock_no:" + stock_no)

    //呼叫server檢核我的最愛
    var url = url_server + "chkFavorite";
    console.log("url:" + url)

    var msg = { account: account, stock: stock_no };

    try {
        var response = await axios.post(url, msg);
    }
    catch (e) {
        console.log(e); // Network Error
        console.log(e.status); // undefined
        console.log(e.code); // undefined
    }

    //承接回傳資訊(已存在/不存在)
    var chk = response.data;
    /*     if (chk == "true") {
            var rtn = true;
        }
        else {
            var rtn = false;
        } */
    console.log("chk:" + chk)
    return chk;
}

function test(e) {
    console.log('test:' + e);
}

export async function getFavoriteCards(account, toStockPrices) {
    console.log('getFavorite!')

    //先檢核是否已登入
    if (account == "None") {
        return <div>請先登入!</div>
    }

    //取得我的最愛清單資訊

    //呼叫server刪除我的最愛
    var url = url_server + "getFavorite";
    console.log("url:" + url)

    var msg = { account: account };

    try {
        var response = await axios.post(url, msg);
    }
    catch (e) {
        console.log(e); // Network Error
        console.log(e.status); // undefined
        console.log(e.code); // undefined
    }

    //承接回傳資訊
    var list = response.data;

    //定義框架
    var stockList = []; //reset

    //組出陣列
    var data_list = [];
    var data = {};
    for (var i = 0; i < list.length; i++) {
        if (list[i].fluct < 0) {
            //跌價
            var change_symbol = "▼"
            var change_color = "green"
        }
        else {
            //漲價
            var change_symbol = "▲"
            var change_color = "red"
        }
        data = {
            name: list[i].name,
            id: list[i].id,
            price: list[i].price,
            fluct: list[i].fluct,
            percent: list[i].percent,
            symbol: change_symbol,
            color: change_color
        }
        data_list.push(data);
    }

    //組合card資訊
    data_list.map(function (stock, i) {
        stockList.push(
            <GridListTile key={i}>
                <Card >
                    <CardActionArea className="card" id={stock.id} onClick={() => toStockPrices(stock)} >
                        <CardContent className="card">
                            <Typography variant="display1" color="textSecondary" >
                                {stock.name}  <font size="5">({stock.id})</font>
                            </Typography>
                            <Typography variant="display2" component="h2" align="center">{stock.price}</Typography>
                            <br />
                            <Typography variant="headline" color="textSecondary" align="center">
                                <font color={stock.color}>{stock.symbol} {stock.fluct}
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        {change_symbol} {stock.percent}%</font>
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </GridListTile>
        )
    })

    /* 
        for (var i = 0; i < list.length; i++) {
            //判斷漲跌
            if (list[i].fluct < 0) {
                //跌價
                var change_symbol = "▼"
                var change_color = "green"
            }
            else {
                //漲價
                var change_symbol = "▲"
                var change_color = "red"
            }
            var newStock =
                <GridListTile>
                    <Card >
                        <CardActionArea className="card" id={list[i].id} onClick={() => callback(list[i].id)} >
                            <CardContent className="card">
                                <Typography variant="display1" color="textSecondary" >
                                    {list[i].name}  <font size="5">({list[i].id})</font>
                                </Typography>
                                <Typography variant="display2" component="h2" align="center">{list[i].price}</Typography>
                                <br />
                                <Typography variant="headline" color="textSecondary" align="center">
                                    <font color={change_color}>{change_symbol} {list[i].fluct}
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        {change_symbol} {list[i].percent}%</font>
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </GridListTile>
    
            await stockList.push(newStock);
            console.log("list[i].id:" + list[i].id);
            console.log("list[i].name:" + list[i].name);
            console.log("list[i].price:" + list[i].price);
            console.log("list[i].fluct:" + list[i].fluct);
            console.log("list[i].percent:" + list[i].percent);
            console.log("---------------------------------");
        }
     */
    //組合外框與內容(Grid外框與內框+cards)
    stockList =
        <div>
            <GridList cols={3}>
                {stockList}
            </GridList>
        </div>
    //await stockList.push(grid_list); 

    return stockList;

}


var JSON = JSON || {};
JSON.stringify = function (obj, par) {
    if (typeof par == 'undefined' || par == 'debug') {	// to initialize it
        JSON.ii = 0;		// stringify iteration index
        JSON.obj = [];	// array containing the object that had been processed by stringify
        JSON.obj.push(obj);
        JSON.debug = (par == 'debug' && typeof par != 'undefined')
    }
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"' + obj.replace(/\\/ig, "\\\\").replace(/"/ig, '\\"').replace(/\n/ig, "\\n").replace(/\t/ig, "\\t") + '"';
        return String(obj);
    }
    else {
        // recurse array or object
        var n, v, json = [];
        var arr = (obj && Array.isArray(obj));	//seems better than arr = (obj && obj.constructor == Array);		

        for (n in obj) {
            v = obj[n];
            t = typeof (v);
            if (t == "function") continue; 		// skip it, if the object is a function

            if (t == "string") v = '"' + v.replace(/\\/ig, "\\\\").replace(/"/ig, '\\"').replace(/\n/ig, "\\n").replace(/\t/ig, "\\t") + '"';
            else if (t == "object" && v !== null) {
                if (JSON.obj.includes(v)) {
                    if (JSON.debug) {
                        try {
                            console.log("!!-recursive object detected and omitted: " + (arr ? "array[" + n + "]" : "object '" + n + "'"))
                        } catch (err) { }
                    }
                    continue;		// skip it, if the object had been processed
                }
                JSON.obj.push(v);
                JSON.ii++
                //if (JSON.ii++>100) return		// turn on it, if you want to prevent it from infinite iteration
                if (JSON.debug) {
                    try {
                        if (arr)
                            console.log("[level:" + JSON.ii + "] array[" + n + "]")
                        else
                            console.log("[level:" + JSON.ii + " object]" + n)
                    } catch (err) { }
                }
                v = JSON.stringify(v, "sub_object");
                JSON.ii--
            }

            json.push((arr ? "" : '"' + n + '":') + String(v));
            if (JSON.debug) {
                try {
                    console.log((arr ? "" : '"' + n + '":') + String(v))
                } catch (err) { }
            }
        }	// for

        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
}