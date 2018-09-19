var SegfaultHandler = require('segfault-handler');
 
SegfaultHandler.registerHandler("crash.log");
const cv = require('opencv4nodejs');
const path = require('path')
const fs = require('fs')
const fr = require('face-recognition').withCv(cv)

// var app = require('express')();
// var http = require('http').Server(app)
const {
    getAppdataPath
} = require('/var/www/html/node_modules/opencv4nodejs/lib/commons.js')
var moment = require('moment');

const fps = 30;
var predicting = false;
var faceRects = 0;
var isFace = false;
var lastUnknown = moment().subtract(3, "minutes");

const trainedModelFile = '/var/www/html/homeauto/model.json'
const recognizer = fr.FaceRecognizer()
const detector = fr.FaceDetector()

if (!fs.existsSync(trainedModelFile)) {
    throw new Error('model file not found, please run the faceRecognition2 example first to train and save the model')
} else {
    recognizer.load(require(trainedModelFile))
    console.log(recognizer.getDescriptorState())
}

function drawRectWithText(image, rect, text, color, textColor) {
    const thickness = 1;
    image.drawRectangle(
        new cv.Point(rect.x, rect.y),
        new cv.Point(rect.x + rect.width, rect.y + rect.height),
        color,
        2,
        thickness
    )

    const textOffsetY = rect.height + 20
    image.putText(
        text,
        new cv.Point(rect.x, rect.y + textOffsetY),
        cv.FONT_ITALIC,
        0.6,
        textColor,
        thickness
    )

    return image;
}

function grabFrames(videoFile, delay, onFrame){
    const cap = new cv.VideoCapture('http://192.168.2.231:8080/stream/video.mjpeg');
    cap.set(cv.CAP_PROP_FPS, fps)
    let done = false;
    const intvl = setInterval(() => {
        let frame = cap.read();
        // loop back to start on end of stream reached
        if (frame.empty) {
            cap.reset();
            frame = cap.read();
        }
        if (predicting == false){
        onFrame(frame);
        }
    }, Math.ceil(1000/fps));
};



function runVideoFaceDetection(src, detectFaces){
    
    grabFrames(src, 1, function(frame){
        const frameResized = frame.resizeToMax(700);
        
        // detect faces
        if (predicting == false){
            const faceRects = detectFaces(frameResized);
            //console.log(faceRects);
        } else {
            faceRects = 0;
        }
        
        //console.log(faceRects);
        // if (faceRects != 0) {
        //     predicting = true;
        //     // mark faces with distance > 0.6 as unknown
        //     // draw detection
        //     const unknownThreshold = 1.0;
        //     //faceRects.forEach((faceRect) => {                                                     
        //         var rect = faceRects.rect;
        //         var face = faceRects.face;
                
        //         const cvFace = fr.CvImage(face);
                
        //         //console.log("after");
                
        //         //console.log('DETECTED FACE');
        //         //var prediction = recognizer.predictBest(cvFace, unknownThreshold);
        //         if (1==1){
                    
        //             console.time('detection time');
        //             var prediction = recognizer.predictBest(cvFace, unknownThreshold)
        //             console.timeEnd('detection time');
        //             console.log(prediction.className);
        //             predicting = false;
                
        //         }
                
                    
                
                
        //module.exports.rect = rect;
        //     //})
        // } else {
        //     //console.log('No face here... searching')
        // }
        //cv.imshow('face detection', frameResized);
    
    });
}



const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

function detectFaces(img) {
    if(img.empty){
        return;
    }
    const options = {
        minSize: new cv.Size(100, 100),
        scaleFactor: 1.2,
        minNeighbors: 5,
    }
    //console.time("start");
    const objects = classifier.detectMultiScale(img.bgrToGray(), options).objects;
    
    if(objects[0]){
        if (objects[0].x + objects[0].width > img.cols == false && objects[0].y + objects[0].height > img.rows == false && objects[0].y > 0 && objects[0].x > 0){
            isFace = true;
            // img.getRegion(objects[0]);
            // return objects.map(rect => ({
            //     rect,
            //     face: img.getRegion(rect)
            // }));
            var rect = objects[0];
            exports.faceRect = rect;

            if (predicting == false){
                predicting = true;
                const unknownThreshold = 0.8;
                //faceRects.forEach((faceRect) => {                                                     
                
                //console.timeEnd("start");
                var face = img.getRegion(objects[0]);
                //console.log("predicting");
                //THIS IS THE PROBLEM
                const cvFace = fr.CvImage(face.bgrToGray());
                //console.time('detection time');
                //console.log("done!");
                var prediction = { className: 'unknown', distance: 1.27 };
                prediction = recognizer.predictBest(cvFace, unknownThreshold)
                
                //console.timeEnd('detection time');
                if (isFace){
                    //console.log(prediction);
                    exports.facePrediction = prediction;
                    
                    if(predicting.className != "alex" && moment().diff(lastUnknown) > 120000){
                        //console.log("UNKNOWN");
                        lastUnknown = moment();
                        cv.imwrite("/var/www/html/homeauto/images/faces/unknown/unknown_"+ lastUnknown.format('YYYY-MM-DD-HH-mm-ss') +".jpg", face.bgrToGray());
                        cv.imwrite("/var/www/html/homeauto/images/people/unknown/unknown_"+ lastUnknown.format('YYYY-MM-DD-HH-mm-ss') +".jpg", drawRectWithText(img, rect, "Unknown", new cv.Vec(96, 99, 255), new cv.Vec(96, 255, 99)));
                    }
                }
                
                predicting = false;
            }
            
            // return {face: img.getRegion(objects[0]),
            //         rect: objects[0]};
        }

    } else {
        //console.log("NO FACE");
        exports.facePrediction = { className: 'noface', distance: 1};
        isFace = false;
        return 0;
    }      
}

const webcamPort = 'http://192.168.2.231:8080/stream/video.mjpeg';
runVideoFaceDetection(webcamPort, detectFaces)