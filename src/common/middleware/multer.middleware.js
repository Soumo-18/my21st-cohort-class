import multer from "multer";
import path from 'path'

const storage = multer.diskStorage({
    destination: function(req,res, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req,file,cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
})

const fileFilter = (req,res,cb) => {
    const allowed = ['image/png','image/jpeg','image/gif', 'image/webp']

    if(allowed.includes(file.mimetype)) {
        cb(null, true)
    }
    else {
        cb (new Error("File Type Not Supported"), false)
    }
}


export const upload = multer ({
    storage,
    limits:{ fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
})

/* import path from 'path';

const storage = multer.diskStorage({
    destination: function(req,res, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req,file,cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
})
//const storage = multer.memoryStorage()
// const upload = multer() // by default file stored in memory (buffer)
const upload = multer( { storage } )
app.post('/upload', upload.single("file"), (req,res)=>{
    console.log(req.file.buffer)

    ApiResponse.ok(res, 'File Uploaded')
}) */

// app.post('/upload', upload.array("photos"), (req,res)=>{
//     console.log(req.files)

//     ApiResponse.ok(res, 'File Uploaded')
// })

// app.post('/upload', upload.fields([
//     {name:'avatar', maxCount:1}
// ]), (req,res)=>{
//     console.log(req.files)

//     ApiResponse.ok(res, 'File Uploaded')
// })