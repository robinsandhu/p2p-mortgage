import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import { v1 as uuidv1 } from 'uuid';
import fileUpload from 'express-fileupload';
// import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type'; 
import connection from './database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import pinata from './pinata.js';
import fs from 'fs'

const __dirname = fileURLToPath(import.meta.url);

const PORT = process.env.PORT_NUMBER || 4444;

// setting up middleware for parsing request
app.use(fileUpload());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use((req, res, next) => {
    res.set("Access-Control-Allow-Origin", "*");
    next();
})

const addFileUtil = async(fileName, filePath) => {
    const readableStreamForFile = fs.createReadStream(filePath);
    const options = {
        pinataMetadata: {
            name: fileName
        },
        pinataOptions: {
            cidVersion: 0
        }
    };
    let result = null;
    try{
        result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    }catch(err){
        console.log(err);
    }
    return result;
}

// app.post('/upload', (req, res) => {
//     if(req.files){
//         const doc = req.files.file;
//         fileTypeFromBuffer(doc.data).then((result) => {
//             const { ext } = result;
//             if(ext === 'pdf'){
//                 // const hashSum = crypto.createHash('md5');
//                 // hashSum.update(doc.data);
//                 // const fileName = hashSum.digest('hex') + ".pdf";
//                 const fileName = doc.name;
//                 const filePath = "uploads/" + fileName;
//                 doc.mv(filePath, (err) => {
//                     if(err){
//                         res.status(400).send({ msg: "Failed!", cid: null });
//                     }else{
//                         // upload file to pinata ipfs gateway
//                         const addFile = async () => {
//                             let ipfsAddedFile = await addFileUtil(fileName, filePath);

//                             if(ipfsAddedFile === null){
//                                 res.status(500).send({msg: "Error while pinning the file to pinata IPFS gateway", cid: null });
//                             }
//                             // console.log(ipfsAddedFile["IpfsHash"]);
    
//                             // delete the file from the server
//                             fs.unlink(filePath, (err) => {
//                                 if(err){
//                                     console.log(err);
//                                 }
//                             });
    
//                             res.status(200).send({msg: "File pinned Successfully!", cid: ipfsAddedFile["IpfsHash"]});
//                         }
                        
//                         addFile();
//                     }
//                 })
//             }else{
//                 res.status(400).send({ msg: ext+" not supported!", cid: null });
//             }
//         }).catch((err) => {
//             res.status(500).send({ msg: "File type error!", cid: null });
//         });
        
//     }else{
//         res.status(400).send({ msg: "File not found!", cid: null });
//     }
// })

app.post('/property', (req, res) => {
    const { govPropId, propType } = req.body;

    let doc = null;
    let cid = null
    if(req.files){
        doc = req.files.file;
    }else{
        res.status(400).send({ msg: "File not found!", cid: null });
        return
    }


    fileTypeFromBuffer(doc.data).then((result) => {
        const { ext } = result;
        if(ext === 'pdf'){
            // const hashSum = crypto.createHash('md5');
            // hashSum.update(doc.data);
            // const fileName = hashSum.digest('hex') + ".pdf";
            const fileName = doc.name;
            const filePath = "uploads/" + fileName;
            doc.mv(filePath, (err) => {
                if(err){
                    res.status(400).send({ msg: "Failed!", id: null});
                }else{
                    // upload file to pinata ipfs gateway
                    const addFile = async () => {
                        let ipfsAddedFile = await addFileUtil(fileName, filePath);
                        cid = ipfsAddedFile["IpfsHash"]

                        if(ipfsAddedFile === null){
                            res.status(500).send({msg: "Error while pinning the file to pinata IPFS gateway", id: null});
                        }

                        // check whether this property exists already
                        connection.query('SELECT govPropID from Property WHERE govPropID = ?', [govPropId], (err, results, fields) => {
                            if(err){
                                res.status(500).send({ 
                                    msg: "Something went wrong!", 
                                    id: null
                                });
                            }else{
                                if(results.length === 0){
                                    // property ID
                                    // const uid = uuidv1(); 
                                    // add data to database
                                    connection.query('INSERT INTO Property (govPropId, propType, cid) VALUES (?, ?, ?)', [govPropId, propType, cid], (err, results, fields) => {
                                        if(err){
                                            console.error(err);
                                            res.status(500).send({ msg: "Something went wrong!", id: "" });
                                        }else{
                                            res.status(200).send({ msg: "Successfull", id: cid });
                                        }
                                    });           
                                }else{
                                    res.status(200).send({ msg: "Already Registered!", id: ""})
                                }
                            }
                        });

                        // delete the file from the server
                        fs.unlink(filePath, (err) => {
                            if(err){
                                console.log(err);
                            }
                        });
                    }
                    
                    addFile();
                }
            })
        }else{
            res.status(400).send({ msg: ext+" not supported!", id: null});
        }
    }).catch((err) => {
        res.status(500).send({ msg: "File type error!", id: null});
    });
});

app.get('/property/:id', (req, res) => {
    const id = req.params.id;

    connection.query('SELECT * FROM Property WHERE govPropId = ?', [id], (err, results, fields) => {
        if(results.length !== 0){
            res.status(200).send({ msg: "Success!", property: results[0]});
        }else{
            res.status(400).send({ msg: "No record with "+id, property: ""});
        }
    });
});

app.get('/document/:hash', (req, res) => {
    const hash = req.params.hash
    // var options = {
    //     root: path.join(__dirname, "../uploads/")
    // }
    // const filename = hash+".pdf"
    // res.sendFile(filename, options, (err) => {
    //     if(err){
    //         console.log(err)
    //     }else{
    //         console.log('Sent: ', filename)
    //     }
    // })
    if(hash){
        res.redirect("gateway.pinata.cloud/ipfs/"+hash);
    }else{
        res.status(400).send({msg: "Bad request!"});
    }
})

// bind port
app.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
});
