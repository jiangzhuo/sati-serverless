import * as fs from "fs";

const Busboy = require('busboy');
const inspect = require('util').inspect;
const hasha = require('hasha');
const mime = require('mime');
import { S3 } from 'aws-sdk';

const { REGION: region, BUCKET: bucket } = process.env;
const s3 = new S3();

module.exports.handler = function (event, context, callback) {
  console.log(event.body.length);

  let finalFile;
  let finalMimeType;
  let finalEncoding;
  let finalFileStream;

  const busboy = new Busboy({ headers: event.headers });
  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    finalEncoding = encoding;
    finalMimeType = mimetype;
    finalFileStream = file;

    let buffers = [];
    console.log('File [' + fieldname + ']: filename: ' + filename);
    file.on('data', function (data) {
      buffers.push(data)
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    });
    file.on('end', function () {
      finalFile = Buffer.concat(buffers);
      console.log(`File [${fieldname}] Finished Encoding [${encoding}] MimeType ${mimetype}`);
    });
  });
  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
  });
  busboy.on('finish', function () {
    console.log('Done parsing form!');

    const fileName = `${hasha(finalFile, { algorithm: 'md5' })}.${mime.getExtension(finalMimeType)}`;
    const filename = `test/${fileName}`;

    // const writeStream = fs.createWriteStream(fileName);
    // console.log(fileName)
    // writeStream.write(finalFile);
    // writeStream.end();
    // callback(null, { statusCode: 200, body: "ok" })

    s3.putObject({
      Bucket: bucket,
      Key: `upload/${fileName}`,
      Body: finalFile,
    }, function (err, data) {
      console.log(err, data)
      callback(null,{ statusCode: 200, body: `${fileName} rawUpload avatar success` }) ;
    })
  });

// const Readable = require('stream').Readable;
// const s = new Readable();
// s.push(Buffer.from(JSON.parse(event.toString()).body, 'base64').toString());
// s.push(null);
// s.pipe(busboy);
  busboy.write(event.body, 'binary');
  busboy.end();

// console.log(context);
// callback(null, { statusCode: 200, body: "ok" });
};
//# sourceMappingURL=upload.js.map
