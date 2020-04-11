//Register User
import { GET_ERROR, SET_CURRENT_USER } from "./type";
import axios from "axios";
import setAuthToken from "./../utils/setAuthToken";
import jwt_decode from "jwt-decode";

export const registerUser = (newUser, history) => dispatch => {
  axios
    .post("/dev/auth/register", newUser)
    .then(res => {
      history.push("/login")
    })
    .catch(err =>
      dispatch({
        type: GET_ERROR,
        payload: err.response.data
      })
    );
};

//Login ---get User Token
export const loginUser = (userData, history) => dispatch => {
  axios
    .post("/dev/auth/login", userData)
    .then(res => {
      console.log(res.data)
      // Save LocalHost
      const { token, user } = res.data;
      const content = {
        status: 'error',
        data: 'Please Verify Your Email Address'
      }
      if(!user.isVerify) {
        return dispatch({
          type: GET_ERROR,
          payload: content
        })
        
      }
      console.log(token.accessToken)
      //set token in localStorage
      localStorage.setItem("jwtToken", token.accessToken);

      //set Token to Auth Header
      setAuthToken(token.accessToken);

      //decode token to get user data
      const decoded = jwt_decode(token.accessToken);
      // set user user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>console.log('error')
    );
};

// set login User
export const setCurrentUser = decode => {
  return {
    type: SET_CURRENT_USER,
    payload: decode
  };
};

//logout action
export const logOut = () => dispatch => {
  //remove token in header
  localStorage.removeItem("jwtToken");
  //remove Authorization header
  setAuthToken(false);
  //set current user to empty which will set isAuthorization false
  dispatch(setCurrentUser({}));
};

export const oauthFacebook = (newUser, history) => dispatch => {
  axios
    .post("http://localhost:5000/dev/auth/facebook", { access_token: newUser })
    .then(res => {
      console.log(res)
      const { token } = res.data;
      //set token in localStorage
      localStorage.setItem("jwtToken", token.accessToken);

      //set Token to Auth Header
      setAuthToken(token.accessToken);

      //decode token to get user data
      const decoded = jwt_decode(token.accessToken);
      // set user user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERROR,
        payload: err.response.data
      })
    );
};
