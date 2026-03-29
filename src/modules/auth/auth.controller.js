import * as authService from './auth.service.js'

import ApiResponse from '../../common/utils/api-response.js'

//Bcz of middleware, by the time the code reaches this controller,
//we have a 100% guarantee that req.body contains a perfectly 
// formatted email, name, and password
const register = async(req,res)=> {
  //controller doesn't talk to db.It just passes the safe data down to the authService.register fcuntion

  //it waits (await) for the service to do the 
  // heavy lifting(chekcing for duplicates,hashing the token saving t to DB)

  // once the server hands back the sanitized user object the controller uses ApiResponse.created to fromat a nice, standardized JSON reponse with a 201
    const user = await authService.register(req.body)
    ApiResponse.created(res, "Registration Succces", user)
}


export {register}

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