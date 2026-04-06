import crypto from 'crypto' 
//crypto is a built-in Node.js module.provides cryptographic 
// functionality that is heavily relied upon for security
//  (like hashing, encrypting, and generating secure random numbers).
import jwt from 'jsonwebtoken'

const generateAccessToken =(payload)=> {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    })
}

const verifyAccessToken = (token)=>{
   return jwt.verify(token,process.env.JWT_ACCESS_SECRET);
} 

const generateRefreshToken= (payload)=>{
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET,{
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    })
}

const verifyRefreshToken =(token)=>{
    return jwt.verify(token, process.env.JWR_REFRESH_SECRET)
}

const generateResetToken =()=>{
    const rawToken = crypto.randomBytes(32).toString("hex")
    //This generates 32 bytes of cryptographically strong,
    //  unpredictable random data.
//Why not use Math.random()? Math.random() is predictable.
//  If a hacker figures out the algorithm your server uses,
//  they can guess the next tokens you will generate and hijack accounts.
//  crypto.randomBytes uses the operating system's underlying random number generator, making it virtually impossible to guess.
    
    const hashedToken = crypto.createHash('sha256')
                        .update(rawToken)
                        .digest('hex')
//createHash('sha256') -> Tells Node to prepare a hashing engine using the SHA-256 algorithm.
//(SHA-256 is an industry standard; it's the same math that secures Bitcoin)

//.update(rawToken): Feeds your raw, random binary data into the hashing engine.

//.digest('hex'): Spits out the final scrambled result as a readable hexadecimal string (a mix of numbers 0-9 and letters a-f).
    

    return {rawToken, hashedToken}

    //rawToken: You will email this to the user (e.g., yoursite.com/verify?token=rawToken).

//hashedToken: You save this in MongoDB.

//The Benefit:
//  If a hacker breaches your database, they will only see the hashedToken.
//  Because SHA-256 is a "one-way hash," they cannot reverse-engineer 
//   it to figure out the rawToken. 
// Therefore, they cannot verify fake accounts or reset passwords.

//How verification works later:
//  When the user clicks the link in their email, 
// your server will take the rawToken from the URL, hash it again
//  using the exact same SHA-256 formula, and check if it matches the 
// hashedToken stored in the database.
}

export {
    generateResetToken,
    verifyAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    generateAccessToken,
}