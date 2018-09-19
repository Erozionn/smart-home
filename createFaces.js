const cv = require('opencv4nodejs')
const fr = require('face-recognition').withCv(cv)
const fs = require('fs');
//const detector = fr.FaceDetector()
var j = 0;
fs.readdirSync("/var/www/html/homeauto/images/people/alex").forEach(file => {
    console.log(file);
    const image = fr.loadImage('/var/www/html/homeauto/images/people/alex/' + file);
    const detector = fr.FaceDetector();
    const targetSize = 150;
    const faceImages = detector.locateFaces(image, targetSize);
    faceImages.forEach(function(img, i){
        var mat = cv.imread('/var/www/html/homeauto/images/people/alex/' + file).bgrToGray();
        console.log(mat);
        console.log(img.rect.top);
        const faceMats = faceImages.map(function(mmodRect){
                return fr.toCvRect(mmodRect.rect);
            }).map(function(cvRect){
                return mat.getRegion(cvRect).copy();
            })
            //console.log(Object.keys(faceMats).length);
        //cv.imwrite("", mat);
        // fr.saveImage(`/var/www/html/homeauto/images/faces/alex/alex${j+5}.jpg`, img);
        cv.imwrite(`/var/www/html/homeauto/images/faces/alex/alex${j+6}.jpg`, faceMats[0]);
    });
    j++;
  })
