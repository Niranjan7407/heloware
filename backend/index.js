const express = require('express')
const app = express();
const connectDB = require('./db/connectDB')

app.use(express.json());

require('dotenv').config();

app.listen(process.env.PORT,()=>{
    console.log(`Server is running in port ${process.env.PORT}`);
    connectDB(process.env.DB_URL)
})


