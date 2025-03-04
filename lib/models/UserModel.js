import mongoose from "mongoose";


const Schema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
    },
    income: {
      type: Number,
      min: 0,
    },
    needsRatio: {
      type: Number,
      min: 0,
      max: 100,
    },
    wantsRatio: {
      type: Number,
      min: 0,
      max: 100,
    },
    savingsRatio: {
      type: Number,
      min: 0,
      max: 100,
    },
    expenseCategories: [{
      type: String,
      trim: true,
    }],
      needs: {
        type: Number,
        default: 0,
      },
      wants: {
        type: Number,
        default: 0,
      },
      savings: {
        type: Number,
        default: 0,
      },
      date:{
        type: Date,
        default: Date.now()
      },
    },
   { timestamps: true });

  const UserModel = mongoose.models.user || mongoose.model('user',Schema);

  export default UserModel;