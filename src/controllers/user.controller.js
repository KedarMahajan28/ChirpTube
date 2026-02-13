import path from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { validateHeaderName } from "http";


const generateAccessandRefreshTokens = async (userId)=>{
    try{
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken();
     
      const refreshToken = user.generateRefreshToken();
      

      console.log(accessToken,refreshToken)
      user.refreshToken = refreshToken
      await user.save({validateBeforeSave : false})
    return {accessToken, refreshToken}
    }

    catch(error){
      throw new ApiError(500,"Acess/Refresh Token generation failed")
    }
  }


const registerUser = asyncHandler(async (req, res) => {

  const { fullname, email, username, password } = req.body;

  if ([fullname, email, username, password].some(
    field => !field || field.trim() === ""
  )) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarPath = req.files?.avatar?.[0]?.path
    ? path.resolve(req.files.avatar[0].path)
    : null;

  const coverPath = req.files?.coverImage?.[0]?.path
    ? path.resolve(req.files.coverImage[0].path)
    : null;

  if (!avatarPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadonCloudinary(avatarPath);
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  let coverImage;
  if (coverPath) {
    coverImage = await uploadonCloudinary(coverPath);
  }

  const user = await User.create({
    fullname,
    avatar: avatar.secure_url,
    coverImage: coverImage?.secure_url || "",
    email,
    password,
    username: username.toLowerCase()
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});


const loginUser = asyncHandler(async (req,res)=>{
  // data from req

  // username/email & password verificaton
  // find user
  //password check
  //access and refresh token generate
  //send cookies

  const {email,username,password} = req.body;

  if(!username && !email){
    throw new ApiError(400,"Username or email is required");
  }

  const user = await User.findOne({
    $or:[
      {username} , {email}
    ]
  })

  if(!user){
    throw new ApiError(404,"User not found")

  }

const isPassValid =   await user.isPasswordCorrect(password)

if(!isPassValid){
    throw new ApiError(401,"Invalid password")


  }
  const {accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id)

  
  const LoggedinUser = await User.findById(user._id).select("-password -refreshToken")

  const options ={
    httpOnly : true,
    secure : true
  }


  

  return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200, LoggedinUser, accessToken,refreshToken, "User logged in successfully"))


  
})


const logoutUser = asyncHandler(async (req,res)=>{
     await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            refreshToken: undefined
          }
        },{
          new: true
        }
      )

      return res
             .status(200)
             .clearCookie("accessToken")
              .clearCookie("refreshToken")
              .json(new ApiResponse(200, null, "User logged out successfully"))
    })



const refreshAccessToken = asyncHandler(async (req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(400,"Refresh token is required")
  }

  try{
  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

 const user = await  User.findById(decodedToken._id)
  if(!user){
    throw new ApiError(404,"User not found")
  }
  if(user.refreshToken !== incomingRefreshToken){
    throw new ApiError(401,"Refresh token is expired")
  }

  const options={
    httpOnly : true,
    secure : true
  }

const {accessToken,refreshToken} =  await generateAccessandRefreshTokens(user._id)
  return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200, null, accessToken ,refreshToken, "Access token refreshed successfully"))
  }
  catch(error){
    throw new ApiError(401,error?.message || "Invalid refresh token")
  }
})

const changeCurrentPassword = asyncHandler(async (req,res)=>{

  const {currentPassword, newPassword} = req.body
  
  const user = await User.findById(req.user?._id)

 const isPassCorrect =  await user.isPasswordCorrect(currentPassword)

  if(!isPassCorrect){
    throw new ApiError(401,"Current password is incorrect")
  }
  user.password = newPassword
  await user.save({
    validateBeforeSave : false
  })

  return res
            .status(200)
            .json(new ApiResponse(200, null, "Password changed successfully")) 


  
})

const getCurrentUser = asyncHandler(async (req,res)=>{

  return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountdetails = asyncHandler(async (req,res)=>{
  const {fullname,email} = req.body

  if(!fullname && !email){
    throw new ApiError(400,"At least one field is required to update")
  }

 const user =  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
          fullname : fullname,
          email : email
      }
    },
    {new : true}
  ).select("-password -refreshToken")

  return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))



})

const updateAvatar = asyncHandler(async (req,res)=>{

  const avatarLocalPath = req.file?.path
  
  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
  }
const avatar = await uploadonCloudinary(avatarLocalPath)

if(!avatar){
  throw new ApiError(500,"Avatar upload failed")
}
const user  = await User.findByIdAndUpdate(
  req.user._id,
  {
    $set : {
      avatar : avatar.url
    }
  },
  {new : true}
).select("-password -refreshToken"

)
return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateCoverImage = asyncHandler(async (req,res)=>{
  const CILocalPath = req.file?.path
  
  if(!CILocalPath){
    throw new ApiError(400,"Cover Image file is required")
  }
const ci = await uploadonCloudinary(CILocalPath)

if(!ci.url){
  throw new ApiError(500,"Cover Image upload failed")
}
const user = await User.findByIdAndUpdate(
  req.user._id,
  {
    $set : {
      coverImage: ci.url
    }
  },
  {new : true}
).select("-password -refreshToken")
return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Image updated successfully"))
})


const getUserChannelProfile = asyncHandler(async (req,res)=>{
  const {username} = req.params
  if(!username?.trim()){
    throw new ApiError(400,"Username is required")
  }
 const channel =  await User.aggregate([
  {
    $match : {
      username : username?.toLowerCase()
    }
  },
    {
      $lookup : {
        from : "subscriptions",
        localField : "_id",
        foreignField : "channel",
        as : "subscribers"
      }
    },
    {
      $lookup : {
        from : "subscriptions",
        localField : "_id",
        foreignField : "subscriber",
        as : "subscridTo"
      }
    },
    {
      $addFields : {
        subscriberCount : {
          $size : "$subscribers"
        },
        subscribedCount : {
          $size : "$subscridTo"
        },
        isSubscribed : {
          $cond : {
            if : {$in : [req.user?._id, "$subscibers.subscriber"]},
            then : true,
            else : false
          }
      }
    }
    },
    {
      $project : {
        fullname : 1,
        username : 1,
        subscriberCount : 1,
        subscribedCount : 1,
        isSubscribed : 1,
        avatar : 1,
        coverImage : 1,
        email : 1
      }
    }

 ])
 console.log(channel)
  if(!channel?.length){
    throw new ApiError(404,"Channel not found")
  }

  return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"))

})

const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
      {
        $match: {
          _id : new mongoose.Types.ObjectId(req.user._id)  
        }
      },
      {
         
          $lookup : {
            from : "videos",
            localField : "watchHistory",
            foreignField : "_id",
            as : "watchHistory",
            pipeline : [
              {
                $lookup : {
                  from : "users",
                  localField : "owner",
                  foreignField : "_id",
                  as : "owner",
                  pipeline : [
                    {
                      $project : {
                        fullname :1,
                        username : 1,
                        avatar : 1
                      }
                    }
                  ]
                }
              },
              {
                $addFields : {
                  owner:{
                      $first : "$owner"
                  }
                }
              }
            ]
          }   
      }
    ])
    return res
          .status(200)
          .json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"))

})

export { loginUser ,
          logoutUser,
        registerUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountdetails,
        getUserChannelProfile,
        updateAvatar,
        updateCoverImage,
        getWatchHistory
      };
