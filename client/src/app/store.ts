import { configureStore, combineReducers } from "@reduxjs/toolkit"
import type { Action, ThunkAction } from "@reduxjs/toolkit"
import urlReducer from "../store/urlSlice"

// 1. Root reducer (defined first so RootState can be derived without circular refs)
const rootReducer = combineReducers({
  url: urlReducer,
})

// 2. Types derived from rootReducer — no circularity
export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore["dispatch"]

// 3. Store factory (used by tests to create isolated store instances)
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState })
}

export const store = makeStore()

// 4. Thunk type
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action<string>
>
