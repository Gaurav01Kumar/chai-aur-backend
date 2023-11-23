import { v2 as cloudinary} from "cloudinary";
import fs from "fs"

cloudinary.config({ 
     
  });

  const uploadOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath)return null;
        //upload the file on cloudinary
      const response=await  cloudinary.uploader.upload((localFilePath,
            {
                resource_type:"auto"
            }))

           //file has been uploaded successfull 
           
           console.log("File upload successfully",response.url) 
           return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally save temporay file as the upload operation failed
        return null;
        
    }
  }
// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });
export { uploadOnCloudinary }