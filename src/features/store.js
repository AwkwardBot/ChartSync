import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import graphPositionsReducer from './graph-positions/graphPositionSlice'
import dateRangeReducer from './range-selector/rangeSelectorSlice'


const dateRangePersistConfig = {
    key: 'dateRange',
    storage,
}

const graphPositionsPersistConfig = {
    key: 'graphPositions',
    storage,
}

const persistedDateRangeReducer = persistReducer(dateRangePersistConfig, dateRangeReducer)
const persistedGraphPositionsReducer = persistReducer(graphPositionsPersistConfig, graphPositionsReducer)

const store = configureStore({
    reducer: {
        graphPositions: persistedGraphPositionsReducer,
        dateRange: persistedDateRangeReducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        })
})

const persistor = persistStore(store)

export { store, persistor }
