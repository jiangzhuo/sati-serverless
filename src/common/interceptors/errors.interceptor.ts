// import * as Sentry from '@sentry/node';
import {
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
    private logger = new Logger('ErrInterceptor');

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        return next.handle().pipe(catchError((error) => {
            console.log(error);
            let code, message;
            if (error instanceof HttpException) {
                code = error.getStatus();
                message = error.getResponse();
                this.logger.error(`${code}\t${message}`);
                // return throwError(error)
            } else if (error.code) {
                code = error.code;
                message = error.message || error.details || JSON.stringify(error.data) || '';
                this.logger.error(`${code}\t${message}`);
                // return throwError(new HttpException(message, code))
            } else {
                console.log(error);
                // Sentry.captureException(error);
                code = 500;
                message = error.message || 'unknow error';
                this.logger.error(`${code}\t${message}`);
                // return throwError(new HttpException(message, code))
            }
            return Promise.resolve({
                code,
                message,
            });
        }));
    }
}
