const mongoose = require('mongoose');

const connectDB = async()=>{
    try{
        const data = await mongoose.connect(process.env.DB_URL , {useNewUrlParser: true,useUnifiedTopology: true})
        console.log(`Db Connected at ${data.connection.host}`);
    }catch(err){
        console.log(err);
    }
}

module.exports = connectDB;