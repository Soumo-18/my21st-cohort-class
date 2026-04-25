import * as authService from './auth.service.js'

import ApiResponse from '../../common/utils/api-response.js'
import ApiError from '../../common/utils/api-error.js'

//Bcz of middleware, by the time the code reaches this controller,
//we have a 100% guarantee that req.body contains a perfectly 
// formatted email, name, and password
const register = async(req,res)=> {
  //controller doesn't talk to db.It just passes the safe data down to the authService.register fcuntion

  //it waits (await) for the service to do the 
  // heavy lifting(chekcing for duplicates,hashing the token saving t to DB)

  // once the server hands back the sanitized user object the controller uses ApiResponse.created to fromat a nice, standardized JSON reponse with a 201
    const user = await authService.register(req.body)

   return ApiResponse.created(
      res,
       "Registration Succcessful.Please Verify Your EMAIL",
        user
    )
}

const login = async (req,res) =>{
  const { user, accessToken, refreshToken} = await authService.login(req.body);
 //1. sEND THE REFRESH TOKEN in a cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure:process.env.NODE_ENV=== "production",
    sameSite: "strict",
    maxAge: 7 * 24 *60 *60 *1000, // 7 DAYS
  })

  //2. Send the Access token in a cokie( requires cookie-parser to read later)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 mins
  })

  //3. Send both tokens in the json repsonse 

  ApiResponse.ok(
    res,
    "Login Successful",
    {user, accessToken, refreshToken}
  )
}

const refreshToken = async (req,res) => {
  const token = req.cookies?.refreshToken ;
  const {accessToken} = await authService.refresh(token)
  ApiResponse.ok(
    res,
    "Token Refreshed",
    {accessToken}
  )
}
const logout = async (req,res)=>{
  await authService.logout(req.user.id)
  res.clearCookie("refreshToken")
  ApiResponse.ok(
    res,
    "Logged Out Successfully",
  )
}

const verifyEmail = async (res,req) => {
  await authService.verifyEmail(req.params.token)
  ApiResponse.ok(
    res,
    "Email Verified Successfully",
  )
}

const forgotPassword = async(req,res)=>{
  await authService.forgotPassword(req.body.email)
  ApiResponse.ok(
    res,
    "Password Reset Email Sent. Please Check Your Email !",
  )
}

const resetPassword = async (req,res) =>{
  await authService.resetPassword(req.params.token, req.body.password)
  ApiResponse.ok(
    res,
    "Password Reset Succesful",
  )
}

const getMe = async(req,res) =>{
 const user = await authService.getMe(req.user.id)
 ApiResponse.ok(
  res,
  "User Profile",
  user,
 )
}


const uploadAvatar = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      // 1. Create the error object (matches your class: 1 argument)
      const err = ApiError.badRequest("No File Uploaded with field name 'avatar'");
      
      // 2. Manually send the response (since ApiError doesn't take 'res')
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }

    const result = await authServiceService.avatarUpload(req.user.id, file);

    // ApiResponse works as expected (takes 'res')
    return ApiResponse.ok(res, 'Avatar Uploaded Successfully', { avatarUrl: result.url });

  } catch (error) {
    console.error("Upload error:", error);
    
    // Create and send internal error
    const err = ApiError.internal(error.message);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
};


export {
  
  register, 
  login,  logout,
  refreshToken,
  verifyEmail, 
  forgotPassword, resetPassword,
  getMe, 
  uploadAvatar

}

























/* 
THE CLEAN Architecture Pattern

this setup is called Separation of Concerns


Rouer-> Only cares about URLs

Middleware-> cares about SECURITY & Formatting

Controller-> cares abt receiving the HTTP req and sending the http response

Service-> cares abt business logic(generationg tokens,hashing)

Model(mongoose)-:only cares abt database rules


Because they are separated, if you later decide to change your database from
 MongoDB to PostgreSQL, you only have to change the Mongoose Model. 
The Controller, Router, and Middleware won't need to change at all
*/