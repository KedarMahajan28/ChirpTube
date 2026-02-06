import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadonCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    // CONFIG INSIDE FUNCTION (FIXES ESM + nodemon issue)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return response; // use response.secure_url
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return null;
  }
};

export { uploadonCloudinary };
