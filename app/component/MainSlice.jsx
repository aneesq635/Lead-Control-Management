import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    theme: "dark",
    workspace: [],
    selectedWorkspace: null,
}

const main = createSlice({
    name: "main",
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        setWorkspace: (state, action) => {
            state.workspace = action.payload;
        },
        setSelectedWorkspace: (state, action) => {
            state.selectedWorkspace = action.payload;
        },
    }
})

export const {setTheme, setSelectedWorkspace, setWorkspace} = main.actions;
export default main.reducer;