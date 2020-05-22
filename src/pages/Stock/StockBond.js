import React, { Component, Fragment } from 'react';
import moment from 'moment';
import numeral from 'numeral';
import { connect } from 'umi';
import {Row,Col,Card,Form,Tabs,Select,Button,InputNumber,Input,Modal,Table} from 'antd';
import styles from './StockBond.less';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const { Option } = Select;

class StockBond extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {bondState: 1},
      selectedBondId: '',
      selectedStock: {symbol: null, name: null},
      stockPriceChartSymbol: '',
      bondPriceChartSymbol: '',
      priceChartTabKey: 'STOCK',
      stockPriceChartModalVisible: false,
      priceChangeModalVisible: false,
    };
  }

  formRef = React.createRef();
  
  componentDidMount() {
    this.loadStockBond();
  }

  componentWillUnmount() {
    clearTimeout(this.loopFetchStockRealtimeRankingTimeout);
  }

  loadStockBond = () => {
    if (this.loopFetchStockRealtimeRankingTimeout) {
      clearTimeout(this.loopFetchStockRealtimeRankingTimeout);
    }

    this.props.dispatch({
      type: 'stock/fetchStockBond',
      payload: { ...this.state.formValues },
    });

    const currentHour = moment().hours();
    if (currentHour >= 9 && currentHour <= 15) {
      this.loopFetchStockRealtimeRankingTimeout = setTimeout(() => {
        this.loadStockBond();
      }, 5000);
    }
  };

  handleSearch = values => {
    console.log(values);
      this.setState(
        {
          formValues: values,
        },
        this.loadStockBond
      );
  };

  handleFormReset = () => {
    this.formRef.current.resetFields();

    this.setState(
      {
        formValues: {},
      },
      this.loadStockBond
    );
  };

  renderAdvancedForm() {
    return (
      <Form ref={this.formRef} onFinish={this.handleSearch}  initialValues={{['bondState']:"1"}}>
        <Row>
          <Col md={8}>
              <FormItem label="股票代码" name="symbols">
                <Input style={{width: '220px'}} placeholder="股票代码" />
              </FormItem>
          </Col>
          <Col md={8}>
            <FormItem label="转债价格">
              <Row>
                  <FormItem  name="bondMinPrice" className={styles.subFormItem}>
                    <InputNumber placeholder="最小值" />
                  </FormItem>
                  <span className={styles.spaceSplit}>~</span>
                  <FormItem name="bondMaxPrice" className={styles.subFormItem}>
                    <InputNumber placeholder="最大值" />
                  </FormItem>
              </Row>
            </FormItem>
          </Col>
          <Col md={8}>
            <FormItem label="股票市值">
            <Row>
                <FormItem name="stockMinMarketCapital" className={styles.subFormItem}>
                  <InputNumber placeholder="最小值" />
                </FormItem>
                <span className={styles.spaceSplit}>~</span>
                <FormItem name="stockMaxMarketCapital" className={styles.subFormItem}>
                  <InputNumber placeholder="最大值" />
                </FormItem>
              </Row>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col md={8}>
            <FormItem label="下修次数">
            <Row>
                <FormItem name="bondMinPriceChange" className={styles.subFormItem}>
                  <InputNumber placeholder="最小值" />
                </FormItem>
                <span className={styles.spaceSplit}>~</span>
                <FormItem name="bondMaxPriceChange" className={styles.subFormItem}>
                  <InputNumber placeholder="最大值" />
                </FormItem>
              </Row>
            </FormItem>
          </Col>
          <Col md={8}>
            <FormItem label="股权质押">
            <Row>
                <FormItem name="gqzyMinValue" className={styles.subFormItem}>
                  <InputNumber placeholder="最小值" />
                </FormItem>
                <span className={styles.spaceSplit}>~</span>
                <FormItem name="gqzyMaxValue" className={styles.subFormItem}>
                  <InputNumber placeholder="最大值" />
                </FormItem>
              </Row>
            </FormItem>
          </Col>
          <Col md={8}>
            <FormItem label="债溢价率" >
              <Row>
                  <FormItem name="premiumRtMinValue" className={styles.subFormItem}>
                    <InputNumber placeholder="最小值" />
                  </FormItem>
                  <span className={styles.spaceSplit}>~</span>
                  <FormItem name="premiumRtMaxValue" className={styles.subFormItem}>
                    <InputNumber placeholder="最大值" />
                  </FormItem>
                </Row>
              </FormItem>
          </Col>
        </Row>
        <Row>
            <Col md={8}>
              <FormItem label="上市状态" name="bondState" >
                  <Select placeholder="请选择" style={{ width: '120px' }}>
                    <Option value="1">已上市</Option>
                    <Option value="0">未上市</Option>
                    <Option value="2">所有</Option>
                  </Select>
              </FormItem>
            </Col>
            <Col md={8}>
              <FormItem>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  重置
                </Button>
              </FormItem>
            </Col>
        </Row>
      </Form>
    );
  }

  onCommonSearchFieldChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  showPriceChangeModal = bondId => {
    this.setState({ priceChangeModalVisible: true, selectedBondId: bondId });

    this.props.dispatch({
      type: 'stock/fetchStockBondPriceChange',
      payload: {
        bondId,
      },
    });
  };

  modalClose = () => {
    this.setState({ priceChangeModalVisible: false, selectedBondId: null });
  };

  showStockPriceChart = (symbol, name, bond) => {
    const market = symbol.substring(0, 2);

    this.setState({
      stockPriceChartModalVisible:true, 
      priceChartTabKey: 'STOCK',
      selectedStock: {symbol: symbol.substring(2), name: name}, 
      stockPriceChartSymbol: symbol.substring(2),
      stockPriceChartSymbolMarket: market == 'sh' ? 1 : 2,
      bondPriceChartSymbol: bond
    });
  }

  stockPriceModalClose = () => {
    this.setState({stockPriceChartModalVisible: false});
  }

  onPriceChartTabChange = (key) => {
    this.setState({priceChartTabKey: key});
  }

  render() {
    const { stockbonds, stockbondPriceChange } = this.props;

    const columns = [
      {
        title: '转债代码',
        dataIndex: 'bond_id',
      },
      {
        title: '转债名称',
        dataIndex: 'bond_nm',
        render: (text, record) => (
          <a target="_blank" href={`https://xueqiu.com/S/${record.market.toUpperCase()}${record.bond_id}`}>
            {text}
          </a>
        )
      },
      {
        title: '股票名称',
        dataIndex: 'stock_nm',
        render: (text, record) => (
          <a target="_blank" onClick={() => this.showStockPriceChart(record.stock_id, text, record.bond_id)}>
            {text}
          </a>
        ),
      },
      {
        title: '转债价格',
        dataIndex: 'price',
        align: 'right',
        sorter: (a, b) => a.price - b.price,
        render: (text, record) =>
          record.price_tips == '待上市' ? (
            <span style={{ color: '#ccc' }}>{text}</span>
          ) : (
            numeral(text).format('0.00')
          ),
      },
      {
        title: '溢价率',
        align: 'right',
        dataIndex: 'premium_rt',
        sorter: (a, b) => a.premium_rt - b.premium_rt,
        render: (text, record) =>
          record.price_tips == '待上市' || record.convert_cd == '未到转股期' ? (
            <span style={{ color: '#aaa' }}>{numeral(text).format('0.00')}%</span>
          ) : (
            `${numeral(text).format('0.00')}%`
          ),
      },
      {
        title: '下修数',
        dataIndex: 'adj_scnt',
        align: 'right',
        sorter: (a, b) => a.adj_scnt - b.adj_scnt,
        render: (text, record) =>
          record.adj_cnt > 0 ? (
            <a onClick={() => this.showPriceChangeModal(record.bond_id)}>
              {`${text}/${record.adj_cnt}`}
            </a>
          ) : (
            `${text}/${record.adj_cnt}`
          ),
      },
      {
        title: '涨跌幅',
        dataIndex: 'increase_rt',
        align: 'right',
        sorter: (a, b) => a.increase_rt - b.increase_rt,
        render: (text, record) => (
          <span style={{ color: text > 0 ? 'red' : text < 0 ? 'green' : '#000000a6' }}>
            {numeral(text).format('0.00')}%
          </span>
        ),
      },
      {
        title: '正股涨跌',
        dataIndex: 'sincrease_rt',
        align: 'right',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.sincrease_rt - b.sincrease_rt,
        render: (text, record) => (
          <span style={{ color: text > 0 ? 'red' : text < 0 ? 'green' : '#000000a6' }}>
            {numeral(text).format('0.00')}%
          </span>
        ),
      },
      {
        title: '股价',
        dataIndex: 'sprice',
        align: 'right',
      },
      {
        title: '转股价',
        dataIndex: 'convert_price',
        align: 'right',
      },
      {
        title: '转债占比',
        dataIndex: 'convert_amt_ratio',
        align: 'right',
        sorter: (a, b) => a.convert_amt_ratio - b.convert_amt_ratio,
        render: text => `${numeral(text).format('0.0')}%`,
      },
      {
        title: '发行市值',
        dataIndex: 'orig_iss_amt',
        align: 'right',
        sorter: (a, b) => a.orig_iss_amt - b.orig_iss_amt,
        render: text => `${numeral(text).format('0.00')}亿`,
      },
      {
        title: '剩余市值',
        dataIndex: 'curr_iss_amt',
        align: 'right',
        sorter: (a, b) => a.curr_iss_amt - b.curr_iss_amt,
        render: text => `${numeral(text).format('0.00')}亿`,
    },
      {
        title: '股票市值',
        dataIndex: 'market_capital',
        align: 'right',
        sorter: (a, b) => a.market_capital - b.market_capital,
        render: text => `${numeral(text).format('0.00')}亿`,
      },
    ];

    return (
      <Fragment>
        <Card bordered={false} bodyStyle={{ padding: '16px 0' }}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm} style={{ padding: '0 16px' }}>
              {this.renderAdvancedForm()}
            </div>
            <Table
              rowKey="bond_id"
              size="small"
              columns={columns}
              dataSource={stockbonds}
              pagination={false}
            />
          </div>
        </Card>
        <Modal
          title="转股价下次记录"
          visible={this.state.priceChangeModalVisible}
          onCancel={this.modalClose}
          onOk={this.modalClose}
          destroyOnClose
        >
          <div dangerouslySetInnerHTML={{ __html: stockbondPriceChange }} />
        </Modal>
        <Modal
          // title={<Fragment><a href={`http://stockpage.10jqka.com.cn/${this.state.selectedStock.symbol}`} target="_blank">{this.state.selectedStock.name}</a> {this.state.selectedStock.symbol}</Fragment>}
          visible={this.state.stockPriceChartModalVisible}
          onCancel={this.stockPriceModalClose}
          onOk={this.stockPriceModalClose}
          destroyOnClose
          width="1200px"
          bodyStyle={{padding: 0}}
          centered={true}
          footer={null}
        >
          {/* <iframe height="510" width="100%" src={`http://stockpage.10jqka.com.cn/HQ_v4.html#${this.state.stockPriceChartSymbol}`} frameborder="0" marginwidth="0" marginheight="0" /> */}
          <Tabs activeKey={this.state.priceChartTabKey} onChange={this.onPriceChartTabChange} tabBarStyle={{margin: 0}}>
            <TabPane tab="正股" key="STOCK"><iframe height="720" width="100%" src={`http://quote.eastmoney.com/basic/h5chart-iframe.html?code=${this.state.stockPriceChartSymbol}&market=${this.state.stockPriceChartSymbolMarket}&type=r`} frameborder="0" marginwidth="0" marginheight="0" /></TabPane>
            <TabPane tab="转债" key="BOND"><iframe height="720" width="100%" src={`http://quote.eastmoney.com/basic/h5chart-iframe.html?code=${this.state.bondPriceChartSymbol}&market=${this.state.stockPriceChartSymbolMarket}&type=r`} frameborder="0" marginwidth="0" marginheight="0" /></TabPane>
          </Tabs>
          
        </Modal>
      </Fragment>
    );
  }
}

export default connect(({ stock, loading }) => ({
  stockbonds: stock.stockbonds,
  stockbondPriceChange: stock.stockbondPriceChange,
  loading: loading.models.list,
}))(StockBond);