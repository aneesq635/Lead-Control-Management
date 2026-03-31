import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "./MainSlice";

export const store = configureStore({
    reducer: {
        main: mainReducer,
    },
})