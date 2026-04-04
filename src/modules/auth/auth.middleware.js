import ApiError from "../../common/utils/api-error.js";

import { verifyAccessToken } from "../../common/utils/jwt.utils.js";
import User from './auth.model.js'

// Authenticates using the short-lived access token (header or cookie)
const authenticate = async(req, res, next) =>{
    let token;
    //APPROACH 1: HEADERS(Mobile apps)
    if(req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    //APPROACH 2 COOKIES(Web Browsers)
    //If no header was found fallback to checking cookies
    else if( req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken
    }

    //if neither approach found a token, we will blkock the request
    if(!token) throw ApiError.unauthorized("NOT AUTHENTICATED");
    try {
        const decoded = verifyAccessToken(token)
        const user = await User.findById(decoded.id)
        
        if(!user)throw ApiError.unauthorized("User No Longer Exists");
      
        req.user ={
        id:user._id,
        role:user.role,
        name:user.name,
        email:user.email,
     }
     
     next()

    } catch (error) {
      throw ApiError.unauthorized("Invalid or Expired Token")  
    }

     
}

// Higher-order function — returns middleware configured with allowed roles
const authorize = (...roles)=>{
    return (req,res,next) =>{
        if(!roles.includes(req.user.role)) {
            throw ApiError.forbidden(
                "You don't have Permission to Perform this Action"
            )
        }
        next()
    }
}

export { authenticate, authorize}