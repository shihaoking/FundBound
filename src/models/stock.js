import { queryStockBond, queryStockBondPriceChange } from '@/services/stock';

export default {
  state: {
    stockbonds: [],
    stockbondPriceChange: '',
  },

  effects: {
    *fetchStockBond({ payload }, { call, put }) {
      const response = yield call(queryStockBond, payload);
      yield put({
        type: 'saveStockBond',
        payload: Array.isArray(response) ? response : [],
      });
    },
    *fetchStockBondPriceChange({ payload }, { call, put }) {
      const response = yield call(queryStockBondPriceChange, payload);
      yield put({
        type: 'saveStockBondPriceChange',
        payload: response,
      });
    },
  },

  reducers: {
    saveStockBond(state, action) {
      return {
        ...state,
        stockbonds: action.payload,
      };
    },
    saveStockBondPriceChange(state, action) {
      return {
        ...state,
        stockbondPriceChange: action.payload,
      };
    },
  },
};
