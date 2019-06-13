import { Controller, Get, Param, Res, Req} from '@nestjs/common';
// import { AuthService } from '../user/auth/auth.service';
// import { ErrorsInterceptor } from '../../common/interceptors';
import { S3 } from 'aws-sdk';
const s3 = new S3();

@Controller()
export class DownloadController {
  constructor(
    // private readonly authService: AuthService
  ) {
  }

  @Get('download/*')
  // @UseInterceptors(FileInterceptor('file'))
  async download(@Param() params) {
    let url = s3.getSignedUrl('getObject', { Bucket: process.env.UPLOAD_BUCKET||'sati-serverless-upload-test', Key: params[0], Expires: 5 });
    return { code: 200, message: 'download/:fileKey', data: url  };
  }
}
