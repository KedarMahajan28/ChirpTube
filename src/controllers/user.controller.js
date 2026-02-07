import path from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
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

 const user =  User.findById(decodedToken._id)
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

const {at,rt} =await  generateAccessandRefreshTokens(user._id)
  return res
        .status(200)
        .cookie("accessToken",at,options)
        .cookie("refreshToken",rt,options)
        .json(new ApiResponse(200, null, at,rt, "Access token refreshed successfully"))
  }
  catch(error){
    throw new ApiError(401,error?.message || "Invalid refresh token")
  }
})
export { loginUser ,
          logoutUser,
        registerUser,
        refreshAccessToken
      };
