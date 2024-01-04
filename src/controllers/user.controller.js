import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const acessToken = await user.generateAccessToken();
    const refreshToken = await user.refreshAccessToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { acessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong generating refresh and access token"
    );
  }
};

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
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocal = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required ");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocal);
  //if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required ");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: username.toLowerCase(),
  });
  console.log(user);
  const createduser = await User.findById({ _id: user._id }).select(
    "-password -refreshToken"
  );
  if (createduser) {
    throw new ApiError(500, "Something went wrong while registering the user ");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createduser, "New user register Successfully "));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  //username or email
  //find user
  //password check
  //acess and refresh token
  //send cookie
  const { email, userName, password } = req.body;
  if (!userName && !email) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { acessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  
  return res
    .status(200)
    .cookie("accessToken", acessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          acessToken,
          refreshToken,
        },
        "User logged In Successfully "
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout"));
});

export { registerUser, loginUser, logoutUser };
