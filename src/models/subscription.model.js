import mongoose , { Schema } from 'mongoose';

const subscriptionSchema = new Schema({

    Subscriber : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    channel : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
})


export const Subscription = mongoose.model("Subscription",subscriptionSchema)