
import axios from "../../api/axiosconfig"
import {loaduser,logoutuser} from "../reducers/userSlice"
import {logoutchats} from "../reducers/chatSlice"
import {asyncLoadUserChats} from '../actions/chatAction'

export const asyncRegisterUser = (user)=> async (dispatch,getState) => {
    try {
        console.log(user);
        const res = await axios.post("/api/auth/register",user,{withCredentials: true});

        // dispatch user data to redux store
        await dispatch(loaduser(res.data.user));
        await dispatch(asyncLoadUserChats());
        return true;




    } catch (error) {
    console.error("Register error:",error);
    throw error; // so UI can catch it
    return false;
  }
}

export const asyncLoginUser = (user) => async (dispatch, getState) => {
    try {
        const res =await axios.post("/api/auth/login",user, {
      withCredentials: true,
    });
        //dispatch user data to redux store
        
        await dispatch(loaduser(res?.data?.user))
        await dispatch(asyncLoadUserChats());
        return true;

        
    } catch (error) {
        console.error("Login error",error);
        return false
    }
}

export const asyncLogoutUser = () => async (dispatch, getstate) => {
    try {
        await dispatch(logoutuser());
        await dispatch(logoutchats());
        return true;
    } catch (error) {
        console.log("Logout error :",error);
    }
}

export const asyncLoadCurrentUser = () => async (dispatch, getState) => {
  try {
    const res = await axios.get("/api/auth/profile", { withCredentials: true });

    if (res?.data?.user) {
      await dispatch(loaduser(res.data.user));
      await dispatch(asyncLoadUserChats());
    } else {
      // no user found, clear store
      dispatch(logoutuser());
      dispatch(logoutchats());
    }
  } catch (error) {
    console.log("Profile load error:", error);
    // clear store on error (e.g., 401 unauthorized)
    dispatch(logoutuser());
    dispatch(logoutchats());
  }
};
    
