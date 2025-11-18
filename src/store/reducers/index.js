import { combineReducers } from 'redux';
import ventures from './ventures';
import release from './release';

export default combineReducers({
    ventures,
    release
});
