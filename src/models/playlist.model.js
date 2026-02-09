import mongoose, {Schema} from "mongoose";


const playlistSchema = new Schema(
    {
       name: {
        type : String,
        required : true
         },
         videos : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        discription : {
            type : String,
            required : true
        },

        owner : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
},{

    timestamps : true
})


export const Playlist = mongoose.model("Playlist", playlistSchema)