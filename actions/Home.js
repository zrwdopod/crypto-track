const prefix = 'HOME_';
export const GET_LATEST_CURRENCY_RATE = `${prefix}GET_LATEST_CURRENCY_RATE`;


import {createAction} from 'redux-actions';
import api from '../utils/api';


export const getLatestCurrencyRate = createAction(
    GET_LATEST_CURRENCY_RATE,
    params => api.get('https://rest.coinapi.io/v1/exchangerate/BTC', params),
);
