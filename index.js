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
    let dat = data.replace(/\*(.|\n)*?\*/, '').split(" ")
    let count = {}
	let frequency = {}

    dat.forEach(word => count[word] = count[word] === undefined ? 1 : ++count[word])

    Object.keys(count).forEach(key => {
        frequency[key] = count[key] / dat.length
    })

    return frequency
}

async function getDataFromSource(source, output) {
    const files = await readDir(source)
    const data = await Promise.all(files.map(async fileName => await readFile(source, fileName)))
    const mapped = data.map(datum => { return { input: mapKeywords(datum), output } })
	//console.log(mapped.map(d => d.input))
    return mapped
}

//getDataFromSource(net, __dirname + '/sources/php2', {php : 1}).then(net => {
//  let output = net.run(mapKeywords("node"))
//
//  console.log(output)
//})

async function mapData () {
	const php = await getDataFromSource(__dirname + '/sources/php2', {php : 1})
	const js = await getDataFromSource(__dirname + '/sources/js2', {js : 1})

	return php.concat(js)
}
//mapData().then(data => {
//	net.train(data, {log: true, logPeriod: 1})
//	const jsonData = net.toJSON()
//	fs.writeFile('training.json', JSON.stringify(jsonData), () => console.log('done'))
////	let output = net.run(mapKeywords("<?php"))
////	console.log(output)
//})

const trainingData = fs.readFileSync('training.json')
net.fromJSON(JSON.parse(trainingData))
console.log(net.run(mapKeywords(fs.readFileSync('index.js', 'utf8'))))
