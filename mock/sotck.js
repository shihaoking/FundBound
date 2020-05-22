import { parse } from 'url';
import stockbond from './stockinfo/bond_infos.json';

const urllib = require('urllib');

function getStockBondPriceChange(req, res, u) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const params = parse(url, true).query;

  let result = '';
  urllib.request(
    `https://www.jisilu.cn/data/cbnew/adj_logs/?bond_id=${params.bondId}`,
    (err, data, response) => {
      if (err) {
        throw err; // you need to handle error
      }

      result = data.toString();

      result = result
        .replace('width:400', 'width:100%')
        .replace('<thead>', "<thead class='ant-table-thead'>")
        .replace('<tbody>', "<tbody class='ant-table-tbody'>");
      result = `<div class="ant-table ant-table-small ant-table-scroll-position-left"><div class="ant-table-content"><div class="ant-table-body">${result}</div></div></div>`;

      return res.json(result);
    }
  );
}

function getStockBond(req, res, u) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const params = parse(url, true).query;

  const source = stockbond;

  let result = source;

  if (params.symbols) {
    const searchSymbols = params.symbols.split(',');
    result = result.filter(item => searchSymbols.find(symbol => item.stock_id.substring(2) === symbol) != undefined);
  }
  
  if (params.bondMinPrice) {
    result = result.filter(item => item.price >= params.bondMinPrice);
  }

  if (params.bondMaxPrice) {
    result = result.filter(item => item.price <= params.bondMaxPrice);
  }

  if (params.bondMinRatio) {
    result = result.filter(item => item.convert_amt_ratio >= params.bondMinRatio);
  }

  if (params.bondMaxRatio) {
    result = result.filter(item => item.convert_amt_ratio <= params.bondMaxRatio);
  }

  if (params.stockMinMarketCapital) {
    result = result.filter(item => item.market_capital >= params.stockMinMarketCapital);
  }

  if (params.stockMaxMarketCapital) {
    result = result.filter(item => item.market_capital <= params.stockMaxMarketCapital);
  }

  if (params.bondMinPriceChange) {
    result = result.filter(item => item.adj_scnt >= params.bondMinPriceChange);
  }

  if (params.bondMaxPriceChange) {
    result = result.filter(item => item.adj_scnt <= params.bondMaxPriceChange);
  }

  if (params.gqzyMinValue) {
    result = result.filter(item => item.gqzy >= params.gqzyMinValue);
  }

  if (params.gqzyMaxValue) {
    result = result.filter(item => item.gqzy <= params.gqzyMaxValue);
  }

  if (params.premiumRtMinValue) {
    result = result.filter(item => item.premium_rt >= params.premiumRtMinValue);
  }

  if (params.premiumRtMaxValue) {
    result = result.filter(item => item.premium_rt <= params.premiumRtMaxValue);
  }

  if (params.bondState == 1) {
    result = result.filter(item => item.price_tips !== '待上市');
  } else if(params.bondState == 0) {
    result = result.filter(item => item.price_tips === '待上市');
  }

  return res.json(result);
}

export default {
  'GET /api/stock/stockbond': getStockBond,
  'GET /api/stock/stockbondPriceChange': getStockBondPriceChange,
};
