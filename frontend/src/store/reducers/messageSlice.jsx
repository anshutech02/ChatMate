import {createSlice} from "@reduxjs/toolkit"

const initialState ={
    messages : []
}

const messageSlice = createSlice({
    name: "messages",
    initialState,
    reducers :{
        loadmessages : (state, action)=>{
            state.messages = action.payload;
        },
        pushmessage :(state, action)=>{
            state.messages.push(action.payload);
        },
        clearmessages : (state, action)=>{
            state.messages = state.messages.filter(message => message.chatId !== action.payload)
        }
    }
})

export default messageSlice.reducer;
export const {loadmessages,pushmessage,clearmessages} = messageSlice.actions;