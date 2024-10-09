const express = require('express')
const cors = require("cors")
const multer = require("multer")
const { v4: uuidv4 } = require('uuid');
const path = require("path")
const fs = require("fs")
const { exec } = require("child_process")

const app = express()
const PORT = 8000


//Cors config
app.use(cors({
    origin: ["http://localhost:5173"]
}))

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*") // watch it
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next()
  })


//Multer
// multer is a body parsing middleware
// that handles content type multipart/form-data
// That means it parses the raw http request data
// which are primarily used for file upload, 
// and makes it more accessible (storing on disk / in memory /...) for further processing.

//uploaded file storage configurations
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads")
    },

    filename: function(req, file, cb){
        cb(null, file.fieldname + "_" + uuidv4() + path.extname(file.originalname))
    } 
})

//instance of multer - middleware
const upload = multer({storage: storage})

//parse json body
app.use(express.json()) // Parses incoming JSON request bodies and makes the data accessible via req.body.

//parse form-data
app.use(express.urlencoded({extended: true})) 
// Parses URL-encoded form data and makes it accessible via req.body.
//When extended: true, it allows for rich objects and arrays to be encoded into the URL-encoded format (using the qs library).

//serve static files
app.use("/uploads", express.static("uploads"))
// OR, app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serves static files (e.g., uploaded files) from the uploads directory, making them accessible through the /uploads URL path.


//GET
app.get("/", (req, res) => {
    res.status(200)
        .json({
            message : "Home Page"
        })
})


//POST - using multer middleware
//Converting only single for now at a time

// NOTE : The output path considered - `./uploads/${videoUploadSubFolder}/${videoUploadFinalFolder}/index.m3u8`

app.post("/upload", upload.single('file'), (req, res) => { 
    const videoUploadSubFolder = "topic1"   //sub-folder after uploads
    const videoUploadFinalFolder = uuidv4()  //random value generated as unique name
    const uploadedVideoPath = req.file.path //directory where the file is uploaded by the user
    const outputPath = `./uploads/${videoUploadSubFolder}/${videoUploadFinalFolder}`  //directory where the processed/segmented files should be stored
    const hlsPath = `${outputPath}/index.m3u8`  //file which contains details about the processed/segmentation of the video file
    
    console.log("hlsPath : ", hlsPath);

    if(!fs.existsSync(outputPath)){
        fs.mkdirSync(outputPath, {recursive:true})
    }

    // ffmpeg command - NOTE : Should be in a single line
    // that takes a video file and converts it into an HLS (HTTP Live Streaming) format
    // Input: The video at videoPath is loaded.
    // Video and Audio Encoding: The video is encoded using the H.264 codec (libx264) and audio is encoded using the AAC codec.
    // HLS Segmentation: The video is split into 10-second segments (e.g., segment000.ts, segment001.ts, etc.).
    // Playlist Creation: A .m3u8 playlist file (at hlsPath) is created, which references all the segments. The player uses this file to stream the video in chunks.

    const ffmpegCommand = `ffmpeg -i ${uploadedVideoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;
        
    //Running FFMPEG command - to process the uploaded file
    exec(ffmpegCommand, (error, stdout, stderr) => {
        if(error){
            console.log(`exec error : ${error}`);
        }
        console.log(`stdout : ${stdout}`);
        console.log(`stderr : ${stderr}`);

        const videoDetailedIndexURL = `http://localhost:${PORT}/uploads/${videoUploadSubFolder}/${videoUploadFinalFolder}/index.m3u8`

        res.status(201)
            .json({
                message : "Video Converted to HLS format",
                videoDetailedIndexURL : videoDetailedIndexURL,
                videoUploadFinalFolder : videoUploadFinalFolder
        })   
    })

})


app.listen(PORT, (error) => {
    console.log(`App is listening on PORT : ${PORT}`)
})
