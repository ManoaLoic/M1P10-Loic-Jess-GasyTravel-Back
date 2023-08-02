var express = require('express');
var router = express.Router();
const Post = require('../model/Post');
const mongoose = require("mongoose");

const { initializeApp } = require("firebase/app");
const config = require("../config/firebase.config");
initializeApp(config.firebaseConfig);
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");

const storage = getStorage();

router.post("/upload", async (req, res) => {
    try {
        const base64File = req.body.file;

        if (!base64File) {
            return res.status(400).send("Base64 file not provided.");
        }

        const buffer = Buffer.from(base64File, "base64");

        const dateTime = giveCurrentDateTime();
        const originalName = `${dateTime} - ${req.body.name}`;

        const storageRef = ref(storage, `public/${originalName}`);

        const metadata = {
            contentType: "application/octet-stream",
        };

        const snapshot = await uploadBytesResumable(storageRef, buffer, metadata);

        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('File successfully uploaded.');
        return res.send({
            message: 'file uploaded to firebase storage',
            name: originalName,
            type: "application/octet-stream", // Modify the content type as needed
            downloadURL: downloadURL, // Provide the download URL to the client for direct download
        });
    } catch (error) {
        return res.status(400).send(error.message);
    }
});

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}

router.post('/', function(req, res, next) {
    if(!req.body) 
        res.sendStatus(400);  
  
    const body = req.body;
    
    const item = {
        "titre": body.titre,
        "Description": body.Description,
        "type": body.type,
        "idUser": mongoose.Types.ObjectId(req.user._id),
        "Prix": body.prix,
        "Unite": "Ariary"
    };

    const post = new Post(item);
    post.save((err) => {
        if (err){
          console.log('Error on create Post', err);
          res.sendStatus(500);      
        }
        res.send(post);
        console.log('Create Post:', post);
    });

});

router.get('/', function(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
  
    Post.find({}, "titre Description Prix Unite brand Type")
      .skip(offset)
      .limit(limit)
      .exec((err, docs) => {
        if (err) {
          console.log('Error', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        
        Post.countDocuments({}, (err, totalCount) => {
          if (err) {
            console.log('Error', err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
  
          const maxPage = Math.ceil(totalCount / limit);

          res.json({
            docs: docs,
            maxPage: maxPage
          });
        });
      });
  });
  

module.exports = router;