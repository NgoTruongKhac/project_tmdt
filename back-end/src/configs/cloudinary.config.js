import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_CLOUD_NAME } from "./env.js";
import { CLOUDINARY_API_KEY } from "./env.js";
import { CLOUDINARY_API_SECRET } from "./env.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export default cloudinary;
