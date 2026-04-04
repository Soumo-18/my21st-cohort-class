// import express from 'express'
// const app = express()

// export default app

import express from 'express'
import router from './modules/auth/auth.routes.js';
import cookieParser from 'cookie-parser';
const app = express()

// This tells Express to parse the incoming JSON from Postman into req.body
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', router);

export default app