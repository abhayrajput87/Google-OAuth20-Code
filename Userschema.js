//We are defining userschema in this file

const mongoose=require("mongoose")
const userSchema= new mongoose.Schema( {
    username: String,
    password: String,
    googleId: String
})

module.exports= new mongoose.model("User",userSchema)