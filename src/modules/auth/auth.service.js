import ApiError from '../../common/utils/api-error.js'

import {generateResetToken,generateAccessToken,generateRefreshToken,verifyAccessToken} from '../../common/utils/jwt.utils.js'

import User from './auth.model.js'

import { sendVerificationEmail, sendResetPasswordEmail, sendOrderConfirmationEmail } from '../../common/config/email.js'
import crypto from 'crypto'
import fs from 'node:fs'
import imagekit from '../../common/config/imagekit.js'

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
    // Don't let email failure crash registration — user is already created
    try {
        await sendVerificationEmail( email, rawToken)
    } catch (err) {
        console.error("Failed To Send Verification Email:", err.message)
    }


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
    const isMatch = await user.comparePassword(password)
    if(!isMatch) throw ApiError.unauthorized("Invalid EMail or Passwored")

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
   
    // Verify the refresh token matches what's stored (prevents reuse of old tokens)
    if(user.refreshToken !== hashToken(token)){
        throw ApiError.unauthorized("Invalid Refresh Token - Please LOGIN again")
    }

    const accessToken= generateAccessToken({id: user._id, role:user.role})

    return { accessToken }
    
}

const logout = async(userId) =>{
    // const user = await User.findById(userId)
    // if(!userId) throw ApiError.unauthorized("User not founed");

    // user.refreshToken = undefined; // or user.refreshToken = null;
    // await user.save({ validateBeforeSave: false});

    //cleared stored refresh oken so it can't be reused
    await User.findByIdAndUpdate(userId, {refreshToken:null})
}

// THE Difference
//Setting a property to undefined and calling .save() tells Mongoose to completely 
// delete the field from the database document.

// Setting a property to null tells Mongoose to keep the field in the database,
//  but explicitly set its value to null.

const forgotPassword = async(email)=>{
    const user = await User.findOne({ email })

    if(!user) throw ApiError.notFound("No Account with that Email");

    const {rawToken,hashedToken} = generateResetToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save()
    try {
        await sendResetPasswordEmail( user.email, rawToken)
    } catch (error) {
        console.error("Failed to send reset email", error.message)
    }
}

const resetPassword = async(token, newPassword) =>{
    const hashedToken = hashToken(token)

    const user = await User.findOne({
        resetPasswordToken : hashedToken,
        resetPasswordExpires :{ $gt:Date.now()},
    }).select("+resetPasswordToken +resetPasswordExpires")

    if(!user) throw ApiError.badRequest("Invalid or Expired Reset Token");

    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()
}
const getMe= async(userId) =>{
    const user = await User.findById(userId)
    if(!user) throw ApiError.notFound("User Not Found");
    
    return user
}

const verifyEmail = async(token) =>{
    const trimmed = String(token).trim()
    if(!trimmed) throw ApiError.badRequest("Invalid or Expired Verification Token");
    
    const hashedInput = hashToken(trimmed)
    
    //Attempt 1 Looks in db for a user whose stored token matches the hashedInput
    let user = await User.findOne({verificationToken : hashedInput}).select("+verificationToken")
   //.select("+verificationToken") ensures Mongoose actually returns the token field 


   //Attempt 2: If Attempt 1 failed (meaning no user was found), it tries looking for a user whose 
   //stored token matches the exact, raw string that was passed in. This is the fallback for manual testing.
   if(!user) {
        user = await User.findOne({verificationToken : trimmed}).select("+verificationToken")
    }

    // if both attempts failed
    if(!user) throw ApiError.badRequest("Invalid or Expired Verification Token");
    
    //updates the found user in db, and It sets isVerifies to true and uses
    //$unset to completely delete the verificationToken field from the document
    await User.findByIdAndUpdate(user._id, {
        $set : { isVerified : true},
        $unset : { verificationToken : 1},
    })
    
    return user
}

const avatarUpload = async(userId, file) => {
    try{
        const fileStream = fs.createReadStream(file.path) // Stream-> Instead of loading the whole image into memory, it reads a small chunk of data (a "buffer"
        const uploadResponse = await imagekit.files.upload({
            file:fileStream,
            fileName:file.filename,
            folder:"/users-avatars"
        })
        await User.findByIdAndUpdate(
            userId,
            { avatar: uploadResponse.url },
            { new: true }
        )

        fs.unlinkSync(file.path)

        return {
            url: uploadResponse.url,
            fileId: uploadResponse.fileId
        }
    } catch (error) {
        try {
            if(file.path && fs.existsSync(file.path) ) {
                fs.unlinkSync(file.path)
            }
        } catch (error) {
            console.error("Error Deleting Temp File : ", error)
        }

        throw error
    }
 }

export {register, login, refresh, logout, forgotPassword, resetPassword, getMe, verifyEmail, avatarUpload}