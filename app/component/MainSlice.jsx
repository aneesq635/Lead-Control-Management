import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    theme: "dark",
    workspace: [],
    selectedWorkspace: null,
    leads: [],
    conversations:[],
    allMessages:[],

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
        setLeads: (state, action) => {
            state.leads = action.payload;
        },
        setConversation: (state, action)=>{
            state.conversations = action.payload;
        },
        setAllMessages: (state,action)=>{
            state.allMessages = action.payload
        }
    }
})

export const {setTheme, setSelectedWorkspace, setWorkspace, setLeads, setConversation, setAllMessages} = main.actions;
export default main.reducer;