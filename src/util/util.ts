import fs from "fs";
import Jimp = require("jimp");
import { dirname } from "path";

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      //read the image file located in the input image URL and create a "Jimp" image obj from it
      const photo = await Jimp.read(inputURL);

      //create a path to the directory where filtered img would be stored i.e filtered.306.jpg in util/tmp folder 
      const outpath = "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";

      //filter the image, write the filtered image to <__dirname + outpath> (location of the image) and return an absolute path to the locally saved img
      await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname + outpath, (img: any) => { 
          resolve(__dirname + outpath);
        });
    } catch (error) {
      reject(error);
    }
  });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files: Array<string>) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}
