import {combineReducers, configureStore} from '@reduxjs/toolkit'
import authReducer from './user/authSlice'
import conversationReducer from './user/conversationSlice'
import storage from 'redux-persist/lib/storage'
import { persistReducer } from 'redux-persist'
import thunk from "redux-thunk";

const persistConfig = {
  key: 'root',
  storage,
}

const reducers = combineReducers({
  auth: authReducer,
  conversation: conversationReducer,
});

const persistedReducer = persistReducer(persistConfig, reducers);


const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: [thunk]
});

export default store;