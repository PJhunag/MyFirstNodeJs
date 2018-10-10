import React, { Component } from 'react';
import Stock from './stock'; //股票區塊
import Account from './account'; //帳號區塊

//material-ui
import { withStyles } from "@material-ui/core/styles";
import SearchIcon from '@material-ui/icons/Search';
import FavoriteIcon from '@material-ui/icons/FavoriteBorder';
import HistoryIcon from '@material-ui/icons/History';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';

//Module variable
const styles = theme => ({
  flex: {
    flexGrow: 1,
  },
});

var getFvrt = require('./favorite.js');

class Main extends Component {
  constructor() {
    super()
    this.state = {
      open: true,
      open2: false,
      open3: false,
      choice_name: 'getStockPrices', //stockPrices,tradingVolume
      choice_desc: '股票收盤價紀錄',
      user: "None", //使用者ID,
      show_stock: true, //顯示股票頁
      show_favorite: false, //顯示我的最愛
      favorite: <div>favorite</div>,
      no: "",
      desc: "",
    }
    this.handleChange_getMyFavorite = this.handleChange_getMyFavorite.bind(this); //favorite
    this.handleChange_fromFavoriteToStockPrices = this.handleChange_fromFavoriteToStockPrices.bind(this); //click favorite
  }

  //下拉展開(股票資訊)
  expand_option = () => {
    this.setState(state => ({ open: !state.open }));
  };

  //下拉展開(我的最愛)
  expand_option2 = () => {
    this.setState(state => ({ open2: !state.open2 }));
  };

  //下拉展開(瀏覽紀錄)
  expand_option3 = () => {
    this.setState(state => ({ open3: !state.open3 }));
  };

  handleChange_getStockPrices = () => {
    //呼叫並且刷新主要區塊(右下)
    this.setState(state => ({ choice_name: 'getStockPrices', choice_desc: '股票收盤價紀錄', show_stock: true, show_favorite: false }));
    this.setState(state => ({ show_stock: true, show_favorite: false }));

  }

  handleChange_getTradingVolume = () => {
    //呼叫並且刷新主要區塊(右下)
    this.setState(state => ({ choice_name: 'getTradingVolume', choice_desc: '股票成交量紀錄', show_stock: true, show_favorite: false }));
    this.setState(state => ({ show_stock: true, show_favorite: false }));
  }

  async handleChange_getMyFavorite() {
    //呼叫並且刷新主要區塊(右下)
    //顯示我的最愛區塊
    //隱藏其他區塊
    var fvrt = await getFvrt.getFavoriteCards(this.state.user, this.handleChange_fromFavoriteToStockPrices);
    this.setState(state => ({ show_stock: false, show_favorite: true, favorite: fvrt }));

  }

  //從我的最愛挑選要顯示資訊的股票
  handleChange_fromFavoriteToStockPrices(stock) {

    // console.log('即將開啟(' + no+')股票資訊!')
    //指定no
    this.setState(state => ({ no: stock.id }));
    this.setState(state => ({ desc: stock.name }));
    //刷新股票資訊
    this.handleChange_getStockPrices();
  }

  //設置使用者
  setUser = user_id => {
    this.setState(state => ({ user: user_id }));
    console.log("this.state.user:" + this.state.user)
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <div className='top'>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="title" color="inherit" className={classes.flex}>
                <font className='title' face="微軟正黑體" size="8"><b>股票查詢</b></font><font className='title' face="微軟正黑體" size="3"><b>T.H</b></font>
              </Typography>
              <Account setUser={this.setUser} />
            </Toolbar>
          </AppBar>
        </div>
        <div className='menu'>
          <ListItem button onClick={this.expand_option}>
            <ListItemIcon>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText inset primary="股票資訊查詢" />
            {this.state.open ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={this.state.open} timeout="auto" unmountOnExit>
            <List className="sub_button" component="div" disablePadding>
              <ListItem button onClick={this.handleChange_getStockPrices}>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText inset primary="收盤價歷史紀錄" />
              </ListItem>
            </List>
            <List className="sub_button" component="div" disablePadding>
              <ListItem button onClick={this.handleChange_getTradingVolume}>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText inset primary="成交量歷史紀錄" />
              </ListItem>
            </List>
            <List className="sub_button" component="div" disablePadding>
              <ListItem button onClick={this.handleClick}>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText inset primary="KD線查歷史紀錄" />
              </ListItem>
            </List>
            <List className="sub_button" component="div" disablePadding>
              <ListItem button onClick={this.handleClick}>
                <ListItemIcon>
                  <SearchIcon marginLeft="5%" />
                </ListItemIcon>
                <ListItemText inset primary="月營收歷史紀錄" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button onClick={this.expand_option2}>
            <ListItemIcon>
              <FavoriteIcon />
            </ListItemIcon>
            <ListItemText inset primary="我的最愛" />
            {this.state.open2 ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={this.state.open2} timeout="auto" unmountOnExit>
            <List className="sub_button" component="div" disablePadding>
              <ListItem button onClick={this.handleChange_getMyFavorite}>
                <ListItemIcon>
                  <FavoriteIcon />
                </ListItemIcon>
                <ListItemText inset primary="收藏清單" />
              </ListItem>
            </List>
            <List className="sub_button" component="div" disablePadding>
              <ListItem button onClick={this.handleClick}>
                <ListItemIcon>
                  <FavoriteIcon />
                </ListItemIcon>
                <ListItemText inset primary="施工中" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button onClick={this.expand_option3}>
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText inset primary="瀏覽紀錄" />
            {this.state.open3 ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={this.state.open3} timeout="auto" unmountOnExit>
            <List className="sub_button" component="div" disablePadding>
              <ListItem button onClick={this.handleClick}>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText inset primary="施工中" />
              </ListItem>
            </List>
            <List className="sub_button" component="div" disablePadding>
              <ListItem button onClick={this.handleClick}>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText inset primary="施工中" />
              </ListItem>
            </List>
          </Collapse>
        </div>

        {this.state.show_stock && <Stock name={this.state.choice_name} desc={this.state.choice_desc} user={this.state.user} stock_no={this.state.no} stock_desc={this.state.desc} />}
        {this.state.show_favorite && this.state.favorite}
      </div>
    )
  }
}
export default withStyles(styles)(Main); 