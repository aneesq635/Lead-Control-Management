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
        },
        deleConversation:(state, action)=>{
            // delete conversation as well as lead and messages
            const id = typeof action.payload === 'object' ? (action.payload.conversationId || action.payload._id) : action.payload;
            state.conversations = state.conversations.filter((conv)=>conv._id !== id);
            state.leads = state.leads.filter((lead)=>lead.conversation_id !== id && lead.conversationId !== id);
            state.allMessages = state.allMessages.filter((msg)=>msg.conversation_id !== id && msg.conversationId !== id);
        },
        setAddConversation:(state,action)=>{
            const newConversation = action.payload
            state.conversations = [...state.conversations, newConversation]
        }
    }
})

export const {setTheme, setSelectedWorkspace, setWorkspace, setLeads, setConversation, setAllMessages, deleConversation, setAddConversation} = main.actions;
export default main.reducer;