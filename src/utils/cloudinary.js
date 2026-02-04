import {v2 as cloudinary} from "cloudinary";
import fs from "fs"

const uploadonCloudinary = async (filePath) => {
    try{
        if(!filePath) return null;
       const respone = await cloudinary.uploader.upload(filePath, {

            resource_type: "auto",
        })
        console.log("File uploaded successfully");
        response.url();
        return response;
    }

    catch(error){
        fs.unlinkSync(filePath);
        return null;
    }
}
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
  api_key: process.env.CLOUDINARY_API_KEY , 
  api_secret: process.env.CLOUDINARY_API_SECRET 
  
});

export {uploadonCloudinary}

