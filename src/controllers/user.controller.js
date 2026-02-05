import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/User.model.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res) =>{
  
// get details
//validation
//check if user exists
//check image,avatar
// upload to cloudinary 
// create user object - create entry in db
//  remove pass and refresh token from response
// check for user creation
//return res


const {fullName,email,username,password} = req.body;
console.log(email);

if(
   [fullName,email,username,password].some((field) =>
    field?.trim() === "")
){
    throw new ApiError(400,"All fields are required")
}

   const existedUser =  User.findOne({
        $or :[{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409,"User already exists with this email or username")
    }


    const avatarLocalPath =  req.files?.avatar[0].path
    const coverImageLocalPath =  req.files?.coverImage[0].path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = await uploadonCloudinary(avatarLocalPath)
    const coverImage = await uploadonCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(500,"Failed to upload avatar")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Failed to create user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})



export {registerUser};