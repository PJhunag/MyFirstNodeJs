import axios from 'axios';
import React, { Component } from 'react';
import { withStyles } from "@material-ui/core/styles";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import NewWindow from 'react-new-window'

//var account = require('./account.js')
var CryptoJS = require("crypto-js");

var url_server = 'http://localhost:8000/'; //server ip

//使用者資訊
var user_info = {
    logined: false, //是否已經登入
    account: "", //帳號
}

const styles = theme => ({

    input: {
        display: 'flex',
        padding: 0,
    },
    valueContainer: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
    },
    chip: {
        margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
    },
});

//登入
async function login(acc, pwd) {
    //登入驗證
    var url = url_server + "login";
    console.log("url:" + url)

    var infos = { "account": acc, "password": pwd };
    var msg = { "msg": await encoder(infos) };
    var res_msg = { "success": "", "msg": "" }

    try {
        var response = await axios.post(url, msg);
        res_msg = { "success": response.data.success, "msg": response.data.msg }
        var s_res_msg = JSON.stringify(res_msg)
    }
    catch (e) {
        console.log(e); // Network Error
        console.log(e.status); // undefined
        console.log(e.code); // undefined
    }
    return s_res_msg;
}

//登出
function logout() {

}

//註冊
async function register(acc, pwd, mail, sex) {
    //註冊驗證
    var url = url_server + "register";
    console.log("url:" + url)

    var infos = { "account": acc, "password": pwd, "mail": mail, "sex": sex, };
    var msg = { "msg": await encoder(infos) };

    var res_msg = { "success": "", "msg": "" }

    try {
        var response = await axios.post(url, msg);
        res_msg = { "success": response.data.success, "msg": response.data.msg }
        var s_res_msg = JSON.stringify(res_msg)
    }
    catch (e) {
        console.log(e); // Network Error
        console.log(e.status); // undefined
        console.log(e.code); // undefined
    }
    return s_res_msg;
}

//取得我的最愛
async function favorite(acc) {
    //註冊驗證
    var url = url_server + "favorite";
    console.log("url:" + url)

    var infos = { "account": acc };
    var msg = { "msg": await encoder(infos) };

    var res_msg;

    try {
        var response = await axios.post(url, msg);
        for (var i = 0; i < response.data.length; i++) {
            res_msg[i] = {
                "id": response.data.id,        //股票代碼
                "desc": response.data.desc,    //股票說明
                "price": response.data.price,  //當日收盤價
                "amp": response.data.amp,      //當日漲幅(值)
                "percent": response.data.amp   //當日漲幅(%)
            }
        }
        var s_res_msg = JSON.stringify(res_msg)
    }
    catch (e) {
        console.log(e); // Network Error
        console.log(e.status); // undefined
        console.log(e.code); // undefined
    }
    return s_res_msg;
}

//加密用
async function encoder(infos) {
    var plaintText = JSON.stringify(infos);
    var keyStr = "ka0132oftreeNode"

    // 字符串类型的key用之前需要用uft8先parse一下才能用
    var key = CryptoJS.enc.Utf8.parse(keyStr);

    // 加密
    var encryptedData = CryptoJS.AES.encrypt(plaintText, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    var encryptedBase64Str = encryptedData.toString();
    // 输出：'RJcecVhTqCHHnlibzTypzuDvG8kjWC+ot8JuxWVdLgY='
    console.log(encryptedBase64Str);

    // 需要读取encryptedData上的ciphertext.toString()才能拿到跟Java一样的密文
    var encryptedStr = encryptedData.ciphertext.toString();
    // 输出：'44971e715853a821c79e589bcd3ca9cee0ef1bc923582fa8b7c26ec5655d2e06'
    console.log(encryptedStr);

    // 拿到字符串类型的密文需要先将其用Hex方法parse一下
    var encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedStr);

    // 将密文转为Base64的字符串
    // 只有Base64类型的字符串密文才能对其进行解密
    encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);

    return encryptedBase64Str;

}

class Account extends Component {
    constructor(props) {
        super(props)
        this.state = {
            login_open: false, //跳窗登入
            msg_open: false, //訊息顯示
            msg: "", //提示用訊息變數
            register_open: false, //跳窗註冊
            login_disable: false, //是否顯示login按鈕
            logout_disable: true, //是否顯示logout按鈕
        }
        this.login_accept = this.login_accept.bind(this); //登入確認
        this.register_accept = this.register_accept.bind(this); //註冊確認
    }

    //開啟登入窗
    login_open = () => {
        this.setState(state => ({ login_open: true }));
    };

    //確認登入
    async login_accept() {

        var acc = document.getElementById("login_account").value;
        var pwd = document.getElementById("login_password").value;

        //判斷登入成功否 
        var login_msg = await login(acc, pwd);
        var s_login_msg = JSON.parse(login_msg);

        //判斷成功或失敗
        if (s_login_msg.success) {
            //提示成功
            this.setState(state => ({ msg: s_login_msg.msg }));
            this.setState(state => ({ msg_open: true }));

            //關閉輸入窗
            this.setState(state => ({ login_open: false }));

            //紀錄登入狀態與資訊
            user_info.logined = true; //已登入
            user_info.account = acc;

            //重整login logout按鈕
            this.setState(state => ({ login_disable: true, logout_disable: false }));

            //回傳使用者資訊給上層
            this.props.setUser(acc);
        }
        else {
            //失敗
            this.setState(state => ({ msg: s_login_msg.msg }));
            this.setState(state => ({ msg_open: true }));
        }

    };

    //放棄登入
    login_cancel = () => {
        this.setState(state => ({ login_open: false }));
    };

    //開啟登入窗
    register_open = () => {
        this.setState(state => ({ register_open: true }));
    };

    //開啟登入窗(google)
    register_open_google = () => {
        //開啟google第三方登入
        // for google oauth
        var google_client_id = "448812857469-7bkri2f82fjp8uiohjdidelaat8thgc8.apps.googleusercontent.com";
        var google_secret_id = "t_cHvnpqIW7zz1SYx4FI34ny";
        var google_callback_url = "http://localhost:8000/google_login/callback";
        var google_oauth_url = "https://accounts.google.com/o/oauth2/v2/auth?" +
            //Scope可以參考文件裡各式各樣的scope，可以貼scope url或是個別命名
            "scope=email%20profile&" +
            "redirect_uri=" + google_callback_url + "&" +
            "response_type=code&" +
            "client_id=" + google_client_id;

        window.location.replace(google_oauth_url)

/*         console.log("google_oauth_url:" + google_oauth_url);
        var login = window.open(google_oauth_url, 'newwindow', 'height=600,width=600,top=200,left=500,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no, location=no, modal=yes,');
        var returnValue = window.showModalDialog(google_oauth_url, window); */


        /* 
                
                var google_client_id = "448812857469-7bkri2f82fjp8uiohjdidelaat8thgc8.apps.googleusercontent.com";
                var google_callback_url = "http://localhost:8000/google_login/callback";
                var google_oauth_url = "https://accounts.google.com/o/oauth2/v2/auth?" +
                    //Scope可以參考文件裡各式各樣的scope，可以貼scope url或是個別命名
                    "scope=email%20profile&" +
                    "redirect_uri=" + google_callback_url + "&" +
                    "response_type=code&" +
                    "client_id=" + google_client_id;
                var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
        
                // Create <form> element to submit parameters to OAuth 2.0 endpoint.
                var form = document.createElement('form');
                form.setAttribute('method', 'GET'); // Send as a GET request.
                form.setAttribute('action', oauth2Endpoint);
        
                // Parameters to pass to OAuth 2.0 endpoint.
                var params = {
                    'client_id': google_client_id,
                    'redirect_uri': google_callback_url,
                    'response_type': 'token',
                    'scope': 'profile',
                    'include_granted_scopes': 'true',
                    'state': 'pass-through value'
                };
        
                // Add form parameters as hidden input values.
                for (var p in params) {
                    var input = document.createElement('input');
                    input.setAttribute('type', 'hidden');
                    input.setAttribute('name', p);
                    input.setAttribute('value', params[p]);
                    form.appendChild(input);  
        
                };
        
                // Add form to page and submit it to open the OAuth 2.0 endpoint.
                document.body.appendChild(form);
                console.log("form"+form);
                form.submit();
         */
    }

    //開啟登入窗(google)
    register_open_facebook = () => {
        //開啟google第三方登入
        // for google oauth
        var facebook_client_id = "1129004447267178";
        var facebook_oauth_url = "https://www.facebook.com/dialog/oauth?redirect_uri=" +
            "http://localhost:8000/facebook_login/callback&" +
            "client_id=" + facebook_client_id + "&scope=public_profile&response_type=code";

        window.location.replace(facebook_oauth_url)
    };


    //確認註冊
    async register_accept() {

        var acc = document.getElementById("register_account").value;
        var pwd = document.getElementById("register_password").value;
        var pwd2 = document.getElementById("register_password2").value;
        var mail = document.getElementById("register_mail").value;

        //檢核兩個密碼是否一致
        if (pwd !== pwd2) {
            //失敗
            this.setState(state => ({ msg: "兩次密碼輸入不一致，請重新確認！" }));
            this.setState(state => ({ msg_open: true }));
        }

        //判斷註冊成功否 
        var register_msg = await register(acc, pwd, mail);
        var s_register_msg = JSON.parse(register_msg);

        //判斷成功或失敗
        if (s_register_msg.success) {
            //提示成功
            this.setState(state => ({ msg: s_register_msg.msg }));
            this.setState(state => ({ msg_open: true }));
            //關閉輸入窗
            this.setState(state => ({ register_open: false }));
        }
        else {
            //失敗
            this.setState(state => ({ msg: s_register_msg.msg }));
            this.setState(state => ({ msg_open: true }));
        }
    };

    //放棄註冊
    register_cancel = () => {
        this.setState(state => ({ register_open: false }));
    };

    //點選確認後關閉
    msg_close = () => {
        this.setState(state => ({ msg_open: false }));
    };

    //登出
    logout = () => {
        //紀錄登入狀態與資訊
        user_info.logined = false; //未登入
        user_info.account = "None";

        //重整login logout按鈕
        this.setState(state => ({ login_disable: false, logout_disable: true }));

        //回傳使用者資訊給上層
        this.props.setUser("None");
    };

    render() {
        return (
            <div>
                {user_info.logined && (
                    <div>
                        <IconButton aria-haspopup="true"
                            onClick={this.handleMenu}
                            color="inherit" >
                            <AccountCircle />
                        </IconButton>
                        <Button color="inherit" disabled={this.state.logout_disable} onClick={this.logout}>Logout</Button>
                    </div>
                )}
                {!user_info.logined && (
                    <Button color="inherit" disabled={this.state.login_disable} onClick={this.login_open}>Login</Button>
                )}
                <div>
                    <Dialog open={this.state.login_open} onClose={this.login_cancel} aria-labelledby="form-dialog-title" >
                        <DialogTitle id="form-dialog-title">請輸入帳號以及密碼：</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="login_account"
                                label="請輸入帳號"
                                type="account"
                                fullWidth
                            />
                            <TextField
                                margin="dense"
                                id="login_password"
                                label="請輸入密碼"
                                type="password"
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.register_open} color="primary">註冊新帳號</Button>
                            <Button onClick={this.register_open_google} color="primary">註冊新帳號(google)</Button>
                            <Button onClick={this.register_open_facebook} color="primary">註冊新帳號(FACEBOOK)</Button>
                            <Button onClick={this.login_cancel} color="primary">放棄</Button>
                            <Button onClick={this.login_accept} color="primary">確認</Button>
                        </DialogActions>
                    </Dialog>
                </div>

                <Dialog open={this.state.msg_open} onClose={this.msg_close} aria-labelledby="form-dialog-title" >
                    <DialogTitle id="form-dialog-title">{this.state.msg}</DialogTitle>
                    <DialogActions>
                        <Button onClick={this.msg_close} color="primary">確認</Button>
                    </DialogActions>
                </Dialog>

                <div>
                    <Dialog open={this.state.register_open} onClose={this.register_cancel} aria-labelledby="form-dialog-title" >
                        <DialogTitle id="form-dialog-title">請輸入以下資訊以完成註冊步驟：</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="register_account"
                                label="請輸入帳號"
                                type="account"
                                fullWidth
                            />
                            <TextField
                                margin="dense"
                                id="register_password"
                                label="請輸入密碼"
                                type="password"
                                fullWidth
                            />
                            <TextField
                                margin="dense"
                                id="register_password2"
                                label="請再次輸入密碼"
                                type="password"
                                fullWidth
                            />
                            <TextField
                                margin="dense"
                                id="register_mail"
                                label="請輸入聯絡信箱"
                                type="mail"
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.register_cancel} color="primary">放棄</Button>
                            <Button onClick={this.register_accept} color="primary">確認</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div >
        )
    }
}
export default withStyles(styles)(Account);