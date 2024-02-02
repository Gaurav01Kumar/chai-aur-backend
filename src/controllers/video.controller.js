import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Video } from "../models/video.model";
import { uploadOnCloudinary } from "../utils/cloudinary";

const uploadVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    if (title === "" || title !== undefined) {
      throw new ApiError(400, "Title field is missing or empty");
    }
    if (description === "" || description !== undefined) {
      throw new ApiError(400, "video description field is missing or empty");
    }
    const localVideoFile = req.files?.videoFile[0]?.path;
    const localThumbnail = req.files?.thumbnail[0]?.path;
    if (!localVideoFile) {
      throw new ApiError(400, "Video file required");
    }
    if (!localThumbnail) {
      throw new ApiError(400, "Thumbnail file required");
    }
    const uploadedVideo = await uploadOnCloudinary(localVideoFile);
    const uploadedThumbnail = await uploadOnCloudinary(localThumbnail);
    if (!uploadedVideo) {
      throw new ApiError(400, "Thumbnail file required");
    }
    if (!uploadedThumbnail) {
      throw new ApiError(400, "Thumbnail file required");
    }
    //Checking in the console what's this we are geting from the cloudinary service
    console.log("uploaded thumbnail", uploadedThumbnail);
    console.log("uploaded video ", uploadVideo);
    const currentUserId = req.user.id;
    const createdVideo = await Video.create({
      videoFile: uploadedVideo.url,
      thumbnail: uploadedThumbnail?.url,
      title: title,
      description: description,
      duration: uploadedVideo?.width,
      views: 0,
      owner: currentUserId,
    });
    if (!createdVideo) {
      throw new ApiError(
        500,
        "Something went wrong while uploading video in db"
      );
    }
    return res
      .status(201)
      .json(
        new ApiResponse(201, createdVideo, "New video uploaded successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong ,due to internal server error"
    );
  }
});

const getSignleVideo = asyncHandler(async (req, res) => {
  try {
    const videoId = req.params;
    const seletecdVideo = await Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                fullName: 1,
                lastName: 1,
                username: 1,
              },
            },
          ],
        },
      },
    ]);
    return res
      .status(200)
      .json(new ApiResponse(200, seletecdVideo[0], "Video fetch successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong , Server error ");
  }
});

const getAllVideo = asyncHandler(async (req, res) => {
  try {
    const allVideos = await Video.find({});
    return res
      .status(200)
      .json(new ApiResponse(200, allVideos, "Successfully fetched video"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong due,to server error ");
  }
});

const deleteVideos = asyncHandler(async (req, res) => {
  try {
    const videoId = req.params;
    
    const isVideoDeleted = await Video.findOneAndDelete({ _id: videoId });
    if (!isVideoDeleted) {
      throw new ApiError(409, "Your video Deteltion failed ");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Video Deleted successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong due to the internal server error"
    );
  }
});

export { uploadVideo, getAllVideo,deleteVideos };
