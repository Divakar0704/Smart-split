import mongoose from "mongoose";

export const ConnectDB = async ()=>{
    await mongoose.connect('mongodb+srv://SmartSplit:SmartSplitdb@login.1sdus.mongodb.net/')
    console.log("db connected");
}

