import { Controller, Post, UploadedFile, UseInterceptors, Session, Req, Body, Get, Param } from '@nestjs/common';
import * as rawbody from 'raw-body';
import * as Busboy from 'busboy';
import { FileInterceptor } from '@nestjs/platform-express';
import * as hasha from 'hasha';
import { getExtension } from 'mime';
import * as uuid from 'uuid';
import { S3 } from 'aws-sdk';

const { REGION: region, BUCKET: bucket } = process.env;
console.dir(bucket)
console.log(region)
const s3 = new S3();
const inspect = require('util').inspect;

// import { Configurable, ConfigParam, ConfigService } from 'nestjs-config';

@Controller()
export class UploadController {
  constructor() {
  }

  @Post('upload')
  async upload(@Req() request) {

    return { code: 200, message: `test mock upload success`, data: "aaaa.jpg" };
    const raw = await rawbody(request, { encoding: 'binary' });
    return new Promise(((resolve, reject) => {


      // todo 能改成return 一个Promise 在busboy finish的时候resolve
      // const raw = await rawbody(request, { encoding: 'utf8' });
      let finalEncoding, finalMimeType, finalFileStream, finalFile;

      const busboy = new Busboy({ headers: request.headers });
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

        const fileName = `${hasha(finalFile, { algorithm: 'md5' })}.${getExtension(finalMimeType)}`;

        s3.putObject({
          Bucket: bucket,
          Key: `upload/${fileName}`,
          Body: finalFile,
        }, function (err, data) {
          console.log(err, data)
          if (err) {
            reject(err);
          } else {
            resolve({ code: 200, message: `${fileName} upload avatar success`, data: fileName });
          }
        })

        // const writeStream = fs.createWriteStream(fileName);
        // writeStream.write(finalFile);
        // writeStream.end();
        // return { code: 200, message: 'upload avatar success' };
      });
      busboy.write(raw, 'binary');
      busboy.end();


    }))
  }

  @Post('uploadAvatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file) {
    // let transformedBuffer = Buffer.from(file.buffer.toString('utf8'),'binary');
    let transformedBuffer = file.buffer;
    const fileName = `${hasha(transformedBuffer, { algorithm: 'md5' })}.${getExtension(file.mimetype)}`;

    // const writeStream = fs.createWriteStream(fileName);
    // writeStream.write(transformedBuffer);
    // writeStream.end();

    await s3.putObject({
      Bucket: bucket,
      Key: `avatar/${fileName}`,
      Body: transformedBuffer,
    }).promise();

    return { code: 200, message: `${fileName} uploadAvatar avatar success`, data: fileName };
  }

  @Get('getSignedURL')
  async getSignedURL(@Param() param) {
    // const fileName = `${hasha(file.buffer, { algorithm: 'md5' })}.${getExtension(file.mimetype)}`;
    // const filename = `test/${fileName}`;

    const fileName = param.file || uuid.v1();

    console.log(fileName);
    // const writeStream = fs.createWriteStream(fileName);
    // writeStream.write(file.buffer);
    // writeStream.end();

    let result = await s3.createPresignedPost({
      Bucket: process.env.UPLOAD_BUCKET,
      Expires: 3600,
      Fields: {
        key: fileName
      },
      Conditions: [
        ['content-length-range', 0, 10000000], // 10 Mb
        { 'acl': 'public-read' }
      ]
    });

    return { code: 200, message: 'upload avatar success', data: result };
  }
}
