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
    console.log("chk:"+chk)
    return chk;
}

export async function getFavoriteCards(account,toStockPrices) {
    console.log('getFavorite!')

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
                    <CardActionArea className="card" focusVisible={toStockPrices(list[i].id)} >
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
