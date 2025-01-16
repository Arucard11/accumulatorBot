import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
  chatId: { type: Number, required: true, unique: true }, // User's Telegram ID
  trackedPools: [
    {
      poolId: { type: String, required: false }, // Token pool ID
      tokensInPool: { type: Number, required: false }, 
      address:{type:String, required:false}
    },
  ],
  settings:{
    minChangePercent: { type: Number, required: false }, // Percentage change threshold
    age: { type: String, required:false}
  },
 
  monitoringInstance: { type: String, required:false }, // Reference to the monitoring instance
  
});

export const User = mongoose.model('User', userSchema);


