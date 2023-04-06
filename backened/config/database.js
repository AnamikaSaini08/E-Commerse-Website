const mongoose = require('mongoose');

const connectDB = async()=>{
    const data = await mongoose.connect(process.env.DB_URL , {useNewUrlParser: true,useUnifiedTopology: true})
    console.log(`Db Connected at ${data.connection.host}`);
}

module.exports = connectDB;