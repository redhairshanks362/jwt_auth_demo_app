const mongoose= require("mongoose")
require('dotenv').config();


//const connectionUri = process.env["CONNECTION_URI"];
const connectionUri = "mongodb+srv://anssnnb1:dkuZRp4eSqkvdEW6@cluster0.f5kqhp7.mongodb.net/users?retryWrites=true&w=majority";

mongoose.connect(connectionUri,{
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
    .then(()=>{
        console.log('mongoose connected');
    })
    .catch((e)=>{
        console.log(e);
    });

const logInSchema=new mongoose.Schema({
    nickname:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const LogInCollection=new mongoose.model('LogInCollection',logInSchema)

module.exports=LogInCollection
