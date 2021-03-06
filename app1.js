const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const multer=require("multer");
const GridFsStorage=require("multer-gridfs-storage");
const Grid=require("gridfs-stream");
const methodOverride=require("method-override");
const crypto = require('crypto');
const path = require('path');

const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";

const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


const app=express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
const conn=mongoose.createConnection("mongodb+srv://Jhanvi:JHZ1707@cluster0-x8ept.mongodb.net/sachinDB",{ useNewUrlParser: true });


let gfs;

conn.once('open', () => {
    // Init Stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})


// Create storage engine

const storage = new GridFsStorage({
  url: 'mongodb+srv://Jhanvi:JHZ1707@cluster0-x8ept.mongodb.net/sachinDB',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// @route GET /
// @desc Loads form


// -------------------------------------------------------- GET-----------------------------------------


app.get('/', (req, res) => {
    res.sendFile(__dirname+"/register.html");
});


app.get('/files', (req, res) => {
  let filesData = [];
  let count = 0;
  gfs.collection('uploads'); // set the collection to look up into

  gfs.files.find({}).toArray((err, files) => {
      // Error checking
      if(!files || files.length === 0){
          return res.status(404).json({
              responseCode: 1,
              responseMessage: "error"
          });
      }
      // Loop through all the files and fetch the necessary information
      files.forEach((file) => {
          filesData[count++] = {
              //originalname: file.metadata.originalname,
              filename: file.filename,
              contentType: file.contentType
          }
      });
      res.json(filesData);
  });
});



app.get('/file/:filename', (req, res) => {
  gfs.collection('uploads'); //set collection name to lookup into

  /** First check if file exists */
  gfs.files.find({filename: req.params.filename}).toArray(function(err, files){
      if(!files || files.length === 0){
          return res.status(404).json({
              responseCode: 1,
              responseMessage: "error"
          });
      }
      // create read stream
      var readstream = gfs.createReadStream({
          filename: files[0].filename,
          root: "uploads"
      });
      // set the proper content type 
      res.set('Content-Type', files[0].contentType)
      // Return response
      return readstream.pipe(res);
  });
});


app.get("/student",function(req,res){
  let filesData = [];
  let count = 0;
  gfs.collection('uploads'); // set the collection to look up into

  gfs.files.find({}).toArray((err, files) => {
      // Error checking
      if(!files || files.length === 0){
          res.render("Emptystudent");
         // res.send("No files uploaded yet");
      }
      // Loop through all the files and fetch the necessary information
      files.forEach((file) => {
          filesData[count++] = {
              //originalname: file.metadata.originalname,
              filename: file.filename,
              contentType: file.contentType
          }
      });
      res.render("uploads",{file:filesData});
  });
});

app.get("/uploadsAdmin",function(req,res){
  let filesData = [];
  let count = 0;
  gfs.collection('uploads'); // set the collection to look up into

  gfs.files.find({}).toArray((err, files) => {
      // Error checking
      if(!files || files.length === 0){
       
          res.render("Emptyadmin");
      }
      // Loop through all the files and fetch the necessary information
      files.forEach((file) => {
          filesData[count++] = {
              //originalname: file.metadata.originalname,
              filename: file.filename,
              contentType: file.contentType
          }
      });
      res.render("uploadsAdmin",{file:filesData});
  });
});


app.get("/about",function(req,res){
  res.render("about",{aboutContent:aboutContent});
});

app.get("/aboutAdmin",function(req,res){
  res.render("aboutAdmin",{aboutContent:aboutContent});
});

app.get("/tutsachin1707",function(req,res){
  res.render("index");
});

app.get("/login",function(req,res){
  res.sendFile(__dirname+"/login.html");
})

app.post("/login",function(req,res){
  if(req.body.pwd==="123")
  {
    res.redirect("/tutsachin1707");
  }
  else{
    res.redirect("/login");
  }
});

//-------------------------------------------------------- POST-----------------------------------------
// @route POST /upload
//@desc upload file to DB
app.post('/upload', upload.single('file'), (req, res) => {
  //res.json({ file: req.file });
  //res.sendFile("/uploads");
  res.redirect("/uploadsAdmin");
  });


let port=process.env.PORT;
if(port == null || port ==""){
	port=4000;
}


app.listen(port, function() {
  console.log("Server started ");
});

