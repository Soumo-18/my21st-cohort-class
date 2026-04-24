import express from 'express'
import authRoute from './modules/auth/auth.routes.js';
import cookieParser from 'cookie-parser';
import ApiError from './common/utils/api-error.js';

import ownerRoutes from './modules/ipl-ms/routes/owner.routes.js'
import errorHandler from './common/middleware/error.middleware.js';

const app = express()

// This tells Express to parse the incoming JSON from Postman into req.body
app.use(express.json());
app.use(express.urlencoded({extended : true}))
app.use(cookieParser());
// app.use('/api/auth', router);

app.use('/api/auth', authRoute);
app.use('/api/owners', ownerRoutes)

//to catch all for undefined routes
app.all("{&path}", (req,res) => {
    throw ApiError.notFound(`Route ${req.originalUrl} was Not Found`)
})


app.use(errorHandler)
export default app