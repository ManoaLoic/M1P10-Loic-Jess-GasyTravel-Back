var express = require('express');
var router = express.Router();
const Post = require('../model/Post');
const mongoose = require("mongoose");

const { initializeApp } = require("firebase/app");
const config = require("../config/firebase.config");
initializeApp(config.firebaseConfig);
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");

const storage = getStorage();

var FCM = require('fcm-node');
const { User } = require('../model/Users');

function notifyAll(req, res, next, post){
    User.find({}, "deviceToken")
      .exec((err, docs) => {
        if (err) {
          console.log('Error', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        const devices = [];
        docs.forEach(item => {
            if(item.deviceToken) devices.push(item.deviceToken);
        });

        var serverKey = 'AAAAc_KrhKo:APA91bH07Wimr_JPLloBgUbnTIj1QinHSqKlmqCuoHMh4wK6y10x93yfEATMEv4ZqGZjutZoaug73E9Ug-4as2auXc5E8M_0IfN3JJH330hxG9Gcsc-nqLHF2EC3DvKenUJN0bi_y2jj';
        var fcm = new FCM(serverKey);

        const content = '"Jetez un coup d\'oeil des maintenant"';

        var message = {
            registration_ids: devices,
            notification: {
                title: `Nouveau Post : ${post.titre}`,
                message: content,
                body: content,
                imageUrl: post.brand
            },

            data: {
                title: `Nouveau Post : ${post.titre}`,
                message: content,
                imageUrl: post.brand,
                body: content
            }

        };

        fcm.send(message, function(err, response) {
            if (err) {
                console.log("Something has gone wrong!"+err);
                console.log("Respponse:! "+response);
                return res.status(500).send(err.message);
            } else {
                // showToast("Successfully sent with response");
                console.log("Successfully sent with response: ", response);
                return res.status(200).send(post);
            }

        });

    });
}

router.get('/test', function(req, res, next) {
    notifyAll(req, res, next, {});
});

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
        "Prix": body.Prix,
        "Unite": "Ariary",
        "brand": body.brand,
        "video": body.video
    };

    const post = new Post(item);
    post.save((err) => {
        if (err){
          console.log('Error on create Post', err);
          res.sendStatus(500);      
        }
        notifyAll(req, res, next, post)
        // res.send(post);
        console.log('Create Post:', post);
    });

});

router.get('/', function(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const {q} = req.query;
  
    let filter = {};
    if (q && q.trim() !== "") {
        filter = { titre: { $regex: new RegExp('^' + q, 'i') } };
    }

    Post.find(filter, "titre Description Prix Unite brand Type")
      .skip(offset)
      .limit(limit)
      .exec((err, docs) => {
        if (err) {
          console.log('Error', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        
        Post.countDocuments(filter, (err, totalCount) => {
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

  router.get('/:id', function(req, res, next) {
    const postId = req.params.id;

    Post.findById(postId, (err, post) => {
        if (err) {
            console.log('Error', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    });
});
  

module.exports = router;