const mongoose = require('mongoose');

const connectDB = (url) =>{
    mongoose.connect(url).then(()=>{
        console.log("DB Connected.")
    }).catch((err)=>{
        console.log("Error connecting to DB: ",err);
    })
}

module.exports = connectDB