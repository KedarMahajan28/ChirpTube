import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import { uploadonCloudinary , deleteFromCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc", userId } = req.query

    const filter = {isPublished: true}
    if (userId) filter.owner = userId

    const sortOrder = sortType === "asc" ? 1 : -1

    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        

    const totalVideos = await Video.countDocuments(filter)

    return res.status(200).json({
        success: true,
        page: Number(page),
        limit: Number(limit),
        totalVideos,
        totalPages: Math.ceil(totalVideos / limit),
        videos
    })
})

const uploadVideo = asyncHandler(async (req, res) => {
    const user = req.user

    if (!user) {
        return res.status(401).json(
            new ApiResponse(false, "Unauthorized")
        )
    }

    const { title, description } = req.body

    const videoPath = req.files?.video?.[0]?.path
    const thumbnailPath = req.files?.thumbnail?.[0]?.path

    if (!videoPath || !title || !description) {
        return res.status(400).json(
            new ApiResponse(false, "Video, title and description are required")
        )
    }

    const videoFile = await uploadonCloudinary(videoPath)
    if (!videoFile) {
        return res.status(500).json(
            new ApiResponse(false, "Failed to upload video to cloudinary")
        )
    }

    let thumbnailUrl = ""
    if (thumbnailPath) {
        const thumbnailFile = await uploadonCloudinary(thumbnailPath)
        if (!thumbnailFile) {
            return res.status(500).json(
                new ApiResponse(false, "Failed to upload thumbnail to cloudinary")
            )
        }
        thumbnailUrl = thumbnailFile.url
    }

    const newVideo = await Video.create({
        videofile: videoFile.url,
        thumbnail: thumbnailUrl,
        title,
        description,
        duration: videoFile.duration || 0,
        owner: user._id
    })

    return res.status(201).json(
        new ApiResponse(true, "Video uploaded successfully", newVideo)
    )
})




const getVideoById = asyncHandler(async (req, res) =>{
    const {id} = req?.params

    const video = await Video.findById(id).populate("owner", "username")
    if(!video){
        return res.status(404).json(
            new ApiResponse(false, "Video not found")
        )
    }
    if(video.isPublished === false){
        return res.status(403).json(
            new ApiResponse(false, "Video is not published yet")
        )
    }
    video.views += 1
    await video.save()
     return res.status(200).json(
            new ApiResponse(true, "Video fetched successfully", video)
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const {videoId} = req?.params

    const video = await Video.findById(videoId)

    if(!video){
        return res.status(404).json(
            new ApiResponse(false, "Video not found")
        )
    }
    const user = req.user
        if (!user) {
        return res.status(401).json(
            new ApiResponse(false, "Unauthorized")
        )
        }
        const userId = user._id

        if (!video.owner.equals(userId)){
            return res.status(403).json(
                new ApiResponse(false, "You are not the owner of this video")
            )
        }

        const{ title, description} = req.body
        if(title) video.title = title
        if(description) video.description = description
        const thumbnailPath = req.files?.thumbnail?.[0]?.path

        if(thumbnailPath){
            const thumbnailFile = await uploadonCloudinary(thumbnailPath)
            if(!thumbnailFile){
                return res.status(500).json(
                    new ApiResponse(false, "Failed to upload thumbnail to cloudinary")
                )
            }
            const publicId = video.thumbnail.split("/").slice(-1)[0].split(".")[0]
            await deleteFromCloudinary(publicId)
            video.thumbnail = thumbnailFile.url
        }

        await video.save()
        return res.status(200).json(
            new ApiResponse(true, "Video updated successfully", video)
        )
    
})

const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req?.params
    const video = await Video.findById(videoId)

    if(!video){
        return res.status(404).json(
            new ApiResponse(false, "Video not found")
        )
    }
    const user = req.user
        if (!user) {
        return res.status(401).json(
            new ApiResponse(false, "Unauthorized")
        )
        }
        const userId = user._id
        if (!video.owner.equals(userId)){
            return res.status(403).json(
                new ApiResponse(false, "You are not the owner of this video")
            )
        }

        const publicId = video.videofile.split("/").slice(-1)[0].split(".")[0]
        await deleteFromCloudinary(publicId)

        if(video.thumbnail){
            const thumbnailPublicId = video.thumbnail.split("/").slice(-1)[0].split(".")[0]
            await deleteFromCloudinary(thumbnailPublicId)
        }
        await video.deleteOne()

        return res.status(200).json(
            new ApiResponse(true, "Video deleted successfully")
        )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if(!video){
        return res.json(402).json(
            new ApiResponse(false, "Video not found")
        )
     }
    const user = req.user
    if(!user){
        return res.status(401).json(
            new ApiResponse(false, "Unauthorized")
        )
    }
    const userId = user._id
    if(!video.owner.equals(userId)){
        return res.status(403).json(
            new ApiResponse(false, "You are not the owner of this video")
        )
    }
    video.isPublished = !video.isPublished

    await video.save()
    return res.status(200).json(
        new ApiResponse(true, `Video is now ${video.isPublished ? "published" : "unpublished"}`, video)
    )
    
})


export{
    getAllVideos,
    uploadVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}


