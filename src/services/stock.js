import request from '@/utils/request';
const querystring = require("querystring");

export async function queryStockBond(params) {
  return request(`/api/stock/stockbond?${querystring.stringify(params)}`);
}

export async function queryStockBondPriceChange(params) {
  return request(`/api/stock/stockbondPriceChange?${querystring.stringify(params)}`);
}
