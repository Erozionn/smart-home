const path = require('path')
const fs = require('fs')
const fr = require('face-recognition')
const { join } = require('path')

function getDirectories(path) {
    var directories = fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path+'/'+file).isDirectory()
    });

    for (var i = directories.length - 1; i >= 0; --i) {
        console.log(i);
        if (directories[i] == "unknown") {
            directories.splice(i,1);
        }
    }

    return directories;
}

var people = getDirectories("/var/www/html/homeauto/images/faces/");
console.log(people);

const recognizer = fr.FaceRecognizer();

const dataPath = path.resolve('/var/www/html/homeauto/images/faces/')
const classNames = ['alex', 'lorraine'];

people.forEach(function(person, personNum){
  var imagesByClass = [];
    fs.readdirSync("/var/www/html/homeauto/images/faces/"+person).forEach(function(image, imgNum){
        img = fr.loadImage("/var/www/html/homeauto/images/faces/" + person + "/" + person + imgNum + ".jpg");
        imagesByClass.push(img);
        
        console.log("/var/www/html/homeauto/images/faces/" + person + "/" + person + imgNum + ".jpg");
    });
  console.log(imagesByClass);
  recognizer.addFaces(imagesByClass, person, 10);
});

const modelState = recognizer.serialize();
fs.writeFileSync('model14.json', JSON.stringify(modelState));

// const errors = imagesByClass.map(_ => [])
// imagesByClass.forEach(function(faces, label){
//   const name = classNames[0]
//   console.log('testing %s', name)
//     const prediction = recognizer.predictBest(faces)
//     console.log('%s (%s)', prediction.className, prediction.distance)

//     // count number of wrong classifications
//     if (prediction.className !== name) {
//       errors[label] = errors[label] + 1
//     }
// })

// // print the result
// const result = classNames.map((className, label) => {
//   const numTestFaces = imagesByClass[0].length
//   const numCorrect = numTestFaces - errors[0].length
//   const accuracy = parseInt((numCorrect / numTestFaces) * 10000) / 100
//   return `${className} ( ${accuracy}% ) : ${numCorrect} of ${numTestFaces} faces have been recognized correctly`
// })
// console.log('result:')
// console.log(result)