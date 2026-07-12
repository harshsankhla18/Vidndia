import mongoose from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name?.trim()){
        throw new ApiError(400,"Name is Required");
    }
    if(!description?.trim()){
        throw new ApiError(400,"Description is Required");
    }
    const playlist = await Playlist.create({
        name:name.trim(),description:description.trim(),owner:req.user._id
    });
    return res.status(201)
    .json(new ApiResponse(201,playlist,"Playlist Created Successfully"))
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Invalid User Id");
    }
     const userPlaylists = await Playlist.find(
            {
                owner : userId
            }
        );
        return res.status(200).json(new ApiResponse(200,userPlaylists,"User Playlists Fetched Successfully"));
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist does not exist");
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist Fetched Successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id");
    }
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist does not exist");
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(403,"Only Owner can update playlist");
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    const updated = await Playlist.findByIdAndUpdate(
    playlistId,
    {
        $addToSet: {
            videos: videoId
        }
    },
    {
        new: true
    }
    );
    if(!updated){
        throw new ApiError(400,"Error while adding video to playlist");
    }
    return res.status(200).json(new ApiResponse(200,updated,"Video added to playlist successfully"));
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id");
    }
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist does not exist");
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(403,"Only Owner can update playlist");
    }
    const updated = await Playlist.findByIdAndUpdate(
    playlistId,
    {
        $pull: {
            videos: videoId
        }
    },
    {
        new: true
    }
    );
    if(!updated){
        throw new ApiError(400,"Error while removing video from playlist");
    }
    return res.status(200).json(new ApiResponse(200,updated,"Video Removed from playlist successfully"));

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist does not exist");
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(403,"Only Owner can update playlist");
    }
   await Playlist.findByIdAndDelete(playlistId);
    
    return res.status(200).json(new ApiResponse(200,{},"Deleted playlist successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id");
    }
    if(!name?.trim() && !description?.trim()){
        throw new ApiError(400,"Atleast One field is required")
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist does not exist");
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(403,"Only Owner can update playlist");
    }
    const updateFields = {};
    updateFields.name = playlist.name;
    updateFields.description = playlist.description;
    if(name?.trim()){
        updateFields.name = name.trim();
    }
    if(description?.trim()){
        updateFields.description = description.trim();
    }
    playlist.name =  updateFields.name;
    playlist.description = updateFields.description;
    await playlist.save();
    return res.status(200).json(new ApiResponse(200,playlist,"Updated Playlist successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}