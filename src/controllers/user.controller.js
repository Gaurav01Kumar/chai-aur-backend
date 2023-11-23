import { asyncHandler } from "../utils/asyncHandler.js";
import { APiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
const registerUser = asyncHandler(async (req, res) => {
  //get user details from body
  //validation -not empty
  //check if user already exists:username,email.
  //check for images, check for avatar
  //upload them to cloudinary
  //create user object -create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res
  const { fullName, email, username, password } = req.body;
  //  if(fullName===""){
  //   throw new APiError(400,"Full name is required")
  //  }
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new APiError(400, "All fields are required");
  }
  const existedUser=await User.findOne({
    $or:[{ username },{ email }]
  });
  if(existedUser){
    throw new APiError(409,"User with email or username already exists")
  }
  const avatarLocalPath=req.files?.avatar[0]?.path;
  const coverImageLocal=req.files?.coverImage[0]?.path;
  if(!avatarLocalPath){
    throw new APiError(400,"Avatar file is required ")
  };
  const avatar=await uploadOnCloudinary(avatarLocalPath);
  const coverImage=await uploadOnCloudinary(coverImageLocal);
  if(!avatar){
    throw new APiError(400,"Avatar file is required ")
  }
  const user =await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    userName:username.toLowerCase()
  });
   const createduser=await User.findById({_id:user._id}).select(
    "-password -refreshToken"
   );
   if(createduser){
    throw new APiError(500,"Something went wrong while registering the user ")
   }
   return res.status(201).json(
   new  ApiResponse(200,createduser,"New user register Successfully ")
    )

});
export { registerUser };
