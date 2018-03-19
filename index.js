var brain = require('brain.js')
var fs = require('fs')
var net = new brain.NeuralNetwork();
//
//net.train([{input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 }},
//           {input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 }},
//           {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}]);
//
//var output = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.99, black: 0.002 }
//
//function getDataFromSource(net, source, output) {
//    return new Promise((resolve, reject) => {
//        fs.readdir(source, (err, files) => {
//          files.forEach(file => {
//              fs.readFile(source + "/" + file, 'utf-8', (err, input) => {
//                net.train([{input, output}])
//                  console.log('doint')
//              })
//          })
//            console.log('done')
//          resolve(net)
//        })
//    })
//}
//

const readDir = source => new Promise((res, rej) => {
    fs.readdir(source, (err, files) => {
        res(files)
    })
})

const readFile = (path, file) => new Promise((res, rej) => {
    fs.readFile(path + "/" + file, 'utf-8', (err, input) => {
        res(input)
    })
})

const mapKeywords = data => {
    let dat = data.split(" ")
    let newArr = {}

    dat.forEach(word => newArr[word] = newArr[word] === undefined ? 1 : ++newArr[word])

    Object.keys(dat).forEach(key => {
        newArr[key] = newArr[key] / dat.length
    })
    return newArr
}

async function getDataFromSource(net, source, output) {
    const files = await readDir(source)
    const data = await Promise.all(files.map(async fileName => await readFile(source, fileName)))
    const mapped = data.map(datum => { return { input: {datum: mapKeywords(datum)}, output } })
    net.train(mapped)
    return net
}

getDataFromSource(net, __dirname + '/sources/php', {php : 1}).then(net => {
  let output = net.run({datum: mapKeywords("php")})

  console.log(output)
})
