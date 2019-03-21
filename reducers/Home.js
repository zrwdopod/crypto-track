import {combineReducers} from 'redux'
import {handleActions} from 'redux-actions'

import {
    GET_LATEST_CURRENCY_RATE

} from '../../actions/Home'

const home = handleActions({
    [GET_LATEST_CURRENCY_RATE]: (state, {payload}) => {
        return payload
    }
}, {a:1})



export default combineReducers({
    home
})