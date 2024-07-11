import { response } from "express"
import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async(req, res) =>{
    // get user details from frontend 
    // validation - not empty 
    // check if user already exists :-  username, email 
    // check for image check for avatar
    // uplad them to cloudinary 
    // create user object - create entry in db 
    // remove password and refersh token field from response
    // check for user creation 
    // return response

    const {fullName, email, username, password } = req.body
     console.log("email:_", email)
    if(
        [fullName, email, username, password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400, "all field are required")
    } 



    const existedUser = User.findOne({
        $or :[{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with Email or username already exists ")
    }

    const avatarLocalpath = req.files?.avatar[0]?.path; 
    const coverImageLocalpath = req.files?.coverImage[0]?.path

    if(!avatarLocalpath){
        throw new ApiError(400, "Avatar files is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath)
    const coverImage = await uploadOnCloudinary(coverImageLocalpath)
     
    if(!avatarLocalpath){
        throw new ApiError(400, "Avatar files is required")
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()

    })

    const cretedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if(!cretedUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, cretedUser, "User registered Sucessfully")
    )
        
}  )



export {registerUser}