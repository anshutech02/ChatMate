import {createSlice} from "@reduxjs/toolkit"

const initialState = {
    user: {},
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers:{
        loaduser : (state, action)=>{
            state.user = action.payload;
        },
        updateuser :(state, action)=>{
            state.user = action.payload;
        },
        logoutuser : (state,action)=>{
            state.user = null;
        }

    }
})

export default userSlice.reducer;
export const {loaduser,updateuser,logoutuser} = userSlice.actions;