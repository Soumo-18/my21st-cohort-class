// import express from 'express'
// const app = express()

// export default app

import express from 'express'
import router from './modules/auth/auth.routes.js';
import cookieParser from 'cookie-parser';
import ApiError from './common/utils/api-error.js';
const app = express()

// This tells Express to parse the incoming JSON from Postman into req.body
app.use(express.json());
app.use(express.urlencoded({extended : true}))
app.use(cookieParser());
app.use('/api/auth', router);

//to catch all for undefined routes
app.all("{&path}", (req,res) => {
    throw ApiError.notFound(`Route ${req.originalUrl} was Not Found`)
})

export default app