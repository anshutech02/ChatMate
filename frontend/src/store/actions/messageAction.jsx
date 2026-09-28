import axios from "../../api/axiosconfig"
import { loadmessages } from "../reducers/messageSlice";


export const asyncLoadMessages = (chatId)=> async(dispatch, getState)=>{
    try {
        const res = await axios.get(`/api/messages/${chatId}`);
        const  currentChatMessages = res?.data?.messages;
        // console.log(currentChatMessages)
        

    await dispatch(loadmessages(currentChatMessages));
    } catch (error) {
        console.log(error)
    }
    
}



