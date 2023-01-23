import fs from "fs";
import path from "path";

import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  async function checkImageExists(url: string) {
    try {
      const response = await axios.head(url);
      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch(err) {
      return false;
    }
  }
  
  //GET request: http://{{HOST}}/filteredimage?image_url=https://upload.wikimedia.org/wikipedia/commons/7/74/Lions_at_the_Feldherrnhalle_in_Munich.JPG
  app.get('/filteredimage', async (req, res) => {
    const { image_url } = req.query;

    if (!image_url) {
      return res.status(400).send({ message: 'Please provide an image URL parameter' });
    }

    if (await checkImageExists(image_url as string)) {
      try {
        const filteredImgPath: string = await filterImageFromURL(image_url as string);
        res.sendFile(filteredImgPath, async (err) => {
          if (err) {
            throw err;
          }
          const imagesDirectoryPath: string = path.join(__dirname, "/util/tmp");
          const images: string[] = fs.readdirSync(imagesDirectoryPath);
          const imagesPath: string[] = images.map(image => path.join(imagesDirectoryPath, image));
          await deleteLocalFiles(imagesPath);
        });
      } catch(err) {
        res.status(500).send({ message: "Something went wrong"});
      }
      
    } else {
      res.status(400).send({ message: "Image does not exist. Please provide a valid image and try again"});
    }
  });
  
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();