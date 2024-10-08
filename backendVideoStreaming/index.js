const express = require('express')
import cors from 'cors'
import multer from 'multer'
const { v4: uuidv4 } = require('uuid');
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'

const app = express()

//Cors config
app.use(cors({
    origin: ["http://localhost:5173"]
}))


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

