//react
import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import axios from 'axios';
import classNames from 'classnames';
import Select from 'react-select';
import { emphasize } from '@material-ui/core/styles/colorManipulator';

//material-ui
import { withStyles } from "@material-ui/core/styles";
import purple from '@material-ui/core/colors/purple';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Checkbox from '@material-ui/core/Checkbox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

//先準備相關資訊
var instance = axios.create({
  baseURL: 'http://localhost:8000'
});
var getInfos = require('./getStockInfo.js')
var getFavotie = require('./favorite.js')

//Module variable
var line_chart_list = {
  xAxis: {
    type: 'category',
    data: ['default']
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 500,
  },
  series: [{
    data: [0],
    type: 'line',
    smooth: true
  }]
};

//預設action 
var stock_no = "";

//取得股票清單
var stock_list = [];

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
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
      0.08,
    ),
  },
  noOptionsMessage: {
    fontSize: 16,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  margin: {
    margin: theme.spacing.unit
  },
  search: {
    color: theme.palette.getContrastText(purple[200]),
    backgroundColor: purple[200],
    "&:hover": {
      backgroundColor: purple[400]
    },
    width: '90%',
    marginTop: '5%',
    marginLeft: '5%',
    marginright: '5%'
  },

});
function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          ref: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}
function MultiValue(props) {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
      })}
      onDelete={event => {
        props.removeProps.onClick();
        props.removeProps.onMouseDown(event);
      }}
    />
  );
}

const components = {
  Option,
  Control,
  NoOptionsMessage,
  Placeholder,
  SingleValue,
  MultiValue,
  ValueContainer,
};

class Stock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stock_no: this.props.no,
      list_type: "1_month",
      open: true,
      open2: false,
      open3: false,
      line_chart_list: line_chart_list,
      msg_open: false, //跳窗提示
      msg: "", //跳窗訊息
      favorited: false, //是否添加至我的最愛
    }

    var url = "/getStock/list/ALL";
    instance.get(url).then(response => {
      var data = response.data;
      var ls_stock_list = new Array()
      console.log(data);
      for (var i = 0; i < data.length; i++) {
        console.log(data[i].id + "(" + data[i].name + ")");
        ls_stock_list[i] = { label: data[i].id + "(" + data[i].name + ")" };
      }
      stock_list = ls_stock_list;
      this.forceUpdate();
    });

    this.handleChange_no = this.handleChange_no.bind(this);
    this.handleChange_show_chart = this.handleChange_show_chart.bind(this);
    this.handleChange_no_edit = this.handleChange_no_edit.bind(this); //下拉搜尋(編輯中)
    this.handleChange_type = this.handleChange_type.bind(this); //日期區間(type)
  }

  //挑選股票代碼(編輯過程中)
  handleChange_no_edit(value) {
    var url = "/getStock/list/" + value;
    instance.get(url).then(response => {
      var data = response.data;
      var ls_stock_list = new Array()
      console.log(data);
      for (var i = 0; i < data.length; i++) {
        console.log(data[i].id + "(" + data[i].name + ")");
        ls_stock_list[i] = { label: data[i].id + "(" + data[i].name + ")" };
      }
      stock_list = ls_stock_list;
      this.forceUpdate();
    });
  }

  //挑選股票代碼(完成挑選後)
  async handleChange_no(event) {
    // event.target 是當前的 DOM elment
    // 從 event.target.value 取得 user 剛輸入的值
    // 將 user 輸入的值更新回 state
    stock_no = event.label;
    this.handleChange_show_chart(this.props.name); //顯示圖表
    var chkfvrt = await getFavotie.checkFavorite(this.props.user,stock_no);
    this.state.favorited = chkfvrt; //檢核是否已加入我的最愛
    //console.log("this.state.favorited:"+this.state.favorited)
    //console.log("chkfcrt:"+chkfvrt+",type"+typeof(chkfvrt))
    this.setState(state => ({ favorited: chkfvrt }));
  }

  //改變區間
  handleChange_type = key => (event, value) => {
    this.state.list_type = value;
    this.handleChange_show_chart(this.props.name);
  };

  componentWillReceiveProps(nextProps) {//componentWillReceiveProps方法中第一个参数代表即将传入的新的Props
    if (this.props.name !== nextProps.name) {
      //狀態有異動時觸發刷新
      this.handleChange_show_chart(nextProps.name);
    }
  }

  async handleChange_show_chart(type) {

    //呈現相關資料
    console.log("no:" + stock_no);
    console.log("type:" + this.state.list_type);

    var time = {};
    time = getInfos.getDate(this.state.list_type);

    //抓取當天日期
    var s_time = time.start; //起始時間
    var e_time = time.end; //截止時間

    //取得編號部分
    var ls_tmp = stock_no;
    if (ls_tmp.indexOf("(", 0) > 0) {
      stock_no = ls_tmp.substr(0, ls_tmp.indexOf("(", 0));
    }
    var new_list;
    console.log("this.props.name:" + this.props.name);
    switch (type) {
      case 'getStockPrices':
        //取得價格資訊
        new_list = await getInfos.getStockPrices(stock_no, s_time, e_time);
        line_chart_list = JSON.parse(new_list);
        break;
      case "getTradingVolume":
        //刷新交易量
        new_list = await getInfos.getTradingVolume(stock_no, s_time, e_time);
        line_chart_list = JSON.parse(new_list);
        break;
      case "c":
        //刷新KD線

        break;
      case "d":
        //刷新//刷新月營收

        break;
      default:

        break;
    }

    //刷新畫面
    this.forceUpdate();
  }

  //點選確認後關閉
  msg_close = () => {
    this.setState(state => ({ msg_open: false }));
  };

  //改變收藏狀態
  setFavorite = (event, checked) => {
    if (this.props.user === "None") { 
      //判斷是否已登入
      this.setState(state => ({ msg_open: true, favorited: false, msg: "請先登入系統後再重新添加至我的最愛!" }));
    }
    else if (stock_no === "") {
      //判斷是否已挑股票
      this.setState(state => ({ msg_open: true, favorited: false, msg: "請先挑選股票後再重新添加至我的最愛!" }));
    }
    else {
      //改變畫面狀態
      this.setState(state => ({ favorited: !this.state.favorited }));

      var myfavorite = require('./favorite.js')
      if (this.state.favorited == !true) {
        //呼叫添加
        myfavorite.insertFavorite(this.props.user, stock_no);
      }
      else {
        //呼叫刪除
        myfavorite.deleteFavorite(this.props.user, stock_no);
      }
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div className='parent'>
        <div className='search'><div className='search'>
          <font face="微軟正黑體" size="8"><b> {this.props.desc} </b></font>
          <p />
          請挑選要查詢的股票代碼 :
              <Select
            classes={classes}
            options={stock_list}
            components={components}
            value={this.stock_no}
            onChange={this.handleChange_no}
            placeholder="請選擇欲查詢的股票代碼"
            autoWidth="true"
            onInputChange={this.handleChange_no_edit}
            native="true"
          />
          <FormControlLabel control={<Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} checked={this.state.favorited} />}
            label="收藏" onChange={this.setFavorite} />
          <p />
          查詢區間
            <Grid item xs={12}>
            <FormControl component="fieldset">
              <RadioGroup row name="avatar" aria-label="avatar" value={this.state.list_type} onChange={this.handleChange_type('list_type')}>
                <FormControlLabel value="1_month" control={<Radio />} label="最近一個月" />
                <FormControlLabel value="3_month" control={<Radio />} label="最近三個月" />
                <FormControlLabel value="6_mounth" control={<Radio />} label="最近半年" />
                <FormControlLabel value="1_year" control={<Radio />} label="最近一年" />
                <FormControlLabel value="3_year" control={<Radio />} label="最近三年" />
                <FormControlLabel value="all_year" control={<Radio />} label="全部資料" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <hr />
          <p>目前挑選的股票代碼為:{stock_no}</p>
          <p />
          <hr />
        </div></div>
        <div className='child'>
          <ReactEcharts
            option={line_chart_list}
            style={{ height: '400px', width: '95%' }}
            className='react_for_echarts' />
        </div>
        <Dialog open={this.state.msg_open} aria-labelledby="form-dialog-title" >
          <DialogTitle id="form-dialog-title">{this.state.msg}</DialogTitle>
          <DialogActions>
            <Button onClick={this.msg_close} color="primary">確認</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}
export default withStyles(styles)(Stock);