import ApiError from '../../common/utils/api-error.js'

import {generateResetToken,generateAccessToken,generateRefreshToken,verifyAccessToken} from '../../common/utils/jwt.utils.js'

import User from './auth.model.js'

import { sendVerificationEmail, sendResetPasswordEmail, sendOrderConfirmationEmail } from '../../common/config/email.js'

const hashToken = (token)=>{
    crypto.createHash("sha256").update(token).digest("hex")
}

const register= async ({ name, email, password, role})=>{
    const existing = await User.findOne({email});
    if(existing) throw ApiError.confilct("Email Already Exists");
    
    const { rawToken, hashedToken} = generateResetToken()

    //Saving to the Database
    //This is where Mongoose shines. It takes the user's details 
    // (plus the secure hashedtoken) and creates a new document in MongoDB.
    const user = await User.create({
        name, 
        email,
        password,
        role,
        verificationToken: hashedToken
    })

    //to do send an email to user with token: rawToken
    
    // we send the rawtoken to the user so they can click the link,
    //but the db only stores the hashedTOKen for security
    await sendVerificationEmail( email, rawToken)


//Scrubbing Sensitive Data
    //At this point, the user is successfully saved in the database.
    //  Now, you need to send a "Success!" response back to the frontend. 
    // However, the user variable currently holds their password and verification token in the server's memory.

// .toObject() strips away all the hidden Mongoose database functions
//  and turns it into a plain JavaScript object.

//delete manually rips the password and the token out of that object
//  so you don't accidentally leak them to the frontend.

    const userObj = user.toObject()
    //strips away all the hidden Mongoose database functions and 
    // turns it into a plain JavaScript object.

    delete userObj.password
    //manually rips the password and the token out of that object 
    // so you don't accidentally leak them to the frontend.

    delete userObj.verificationToken

    return userObj 
    // /it returns the clean, safe user object (which now only 
    // contains non-sensitive things like their _id, name, email, and role).
}

const login = async ({email,password})=>{
    //take email and find user in DB
    //then check if password is correct or not?
    // check if verified or not ?
    const user = await User.findOne({email }).select("+password");
    if(!user) throw ApiError.unauthorized("Invalid EMail or Passwored");

    //somehow I'll check password

    if(!user.isVerified) {
        throw ApiError.forbidden("Please verify your email before login")
    }

    const accessToken = generateAccessToken({id: user._id, role: user.role});
    const refreshToken = generateRefreshToken({id:user._id})

    user.refreshToken= hashToken(refreshToken);
    await user.save({validateBeforeSave: false})

    const userObj = user.toObject()
    delete userObj.password; //UNNESSARY
    delete userObj.refreshToken; //UNNESSARY
    //CAN ALSO BE DONE WITH COOKIES
    //iN MOBIOLE APP THERE IS NO COOKIES THATS WHY, WE USE REFRESH TOKEN ACCESTOKEN
    return { user: userObj, accessToken, refreshToken}
}

const refresh = async(token)=>{
    if(!token) throw ApiError.unauthorized("Refresh Token missing");
    const decoded = verifyRefreshToken(token)

    const user = await User.findById(decoded.id).select("+refreshToken");
    if(!user) throw ApiError.unauthorized("User not found");

    if(user.refreshToken !== hashToken(token)){
        throw ApiError.unauthorized("Invalid Refresh Token")
    }

    const accessToken= generateAccessToken({id: user._id, role:user.role})

    return { accessToken }
    
}

const logout = async(userId) =>{
    // const user = await User.findById(userId)
    // if(!userId) throw ApiError.unauthorized("User not founed");

    // user.refreshToken = undefined; // or user.refreshToken = null;
    // await user.save({ validateBeforeSave: false});

    await User.findByIdAndUpdate(userId, {refreshToken:null})
}

const forgotPassword = async(email)=>{
    const user = await User.findOne({ email })

    if(!user) throw ApiError.notFound("No Account with that Email");

    const {rawToken,hashedToken} = generateResetToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save()

    await sendResetPasswordEmail( user.email, rawToken)
}

export {register, login, refresh, logout, forgotPassword}