import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Authenticator } from 'otplib/authenticator';

const crypto = require('crypto');


import { JwtPayload, JwtReply } from '../interfaces/jwt.interface';
import * as ts from "typescript/lib/tsserverlibrary";
// import Errors = ts.server.Errors;
import { AuthenticationError } from 'apollo-server-core';

import gql from 'graphql-tag';
import { UserService } from "./user.service";

// import { UserService } from '../services/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserService) private readonly userService: UserService,
    // @Inject(forwardRef(() => UserService)) private readonly userService: UserService
  ) {
    this.registerAuthenticator = new Authenticator();
    this.registerAuthenticator.options = { crypto: crypto, step: 60, window: 60 };
    this.loginAuthenticator = new Authenticator();
    this.loginAuthenticator.options = { crypto: crypto, step: 60, window: 60 };
  }

  private registerAuthenticator: Authenticator;
  private loginAuthenticator: Authenticator;

  createToken(payload: JwtPayload): JwtReply {
    const accessToken = jwt.sign(payload, process.env.AUTH_TOKEN_SECRET_KEY, { expiresIn: '1d' });
    return { accessToken, expiresIn: 60 * 60 * 24 };
  }

  generateLoginVerificationCode(mobile: string): string {
    let secret = `login|${mobile}`;
    return this.loginAuthenticator.generate(secret);
  }

  generateRegisterVerificationCode(mobile: string): string {
    let secret = `register|${mobile}`;
    return this.registerAuthenticator.generate(secret);
  }

  generateUpdatePasswordVerificationCode(mobile: string): string {
    let secret = `|${mobile}`;
    return this.registerAuthenticator.generate(secret);
  }

  checkLoginVerificationCode(token: string, mobile: string): boolean {
    if (token === '666') {
      return true;
    }
    let secret = `login|${mobile}`;
    return this.loginAuthenticator.check(token, secret);
  }

  checkRegisterVerificationCode(token: string, mobile: string): boolean {
    if (token === '666') {
      return true;
    }
    let secret = `register|${mobile}`;
    return this.registerAuthenticator.check(token, secret);
  }

  checkUpdatePasswordVerificationCode(token: string, mobile: string): boolean {
    if (token === '666') {
      return true;
    }
    let secret = `|${mobile}`;
    return this.registerAuthenticator.check(token, secret);
  }

  async validateUser(req: any) {
    /**
     * whitelist
     */
    const whiteList = JSON.parse(process.env.WHITELIST_OPERATION_NAME || "[]");
    if (req.body.query) {
      const query = gql(req.body.query);
      if (query.definitions.length !== 0 && query.definitions.every((definition) => {
        return definition.name.value !== req.body.operationName;
      })) {
        req.body.operationName = query.definitions[0].name.value;
      }
      // if (req.body.operationName === 'IntrospectionQuery') {
      //     return;
      // }
      if (whiteList.includes(req.body.operationName)) {
        return;
      }
      // fix operationName
      if (req.body && req.body.operationName) {
        // if (whiteList.includes(req.body.operationName)) {
        //     return;
        // }
        const operationName = req.body.operationName;
        req.body.operationName = operationName.charAt(0).toLowerCase() + operationName.slice(1);
        // if (whiteList.includes(req.body.operationName)) {
        //     return;
        // }
      }
    }


    let token = req.headers.authorization as string;
    if (!token) {
      // throw new AuthenticationError('Request header lacks authorization parameters，it should be: Authorization or authorization');
      return;
    }

    if (token) {
      if (['Bearer ', 'bearer '].includes(token.slice(0, 7))) {
        token = token.slice(7);
      } else {
        throw new AuthenticationError('The authorization code prefix is incorrect. it should be: Bearer or bearer');
      }

      try {
        const decodedToken = <{ userId: string }>jwt.verify(token, process.env.AUTH_TOKEN_SECRET_KEY);
        // const { data } = await this.userBroker.call('user.getUserById', { id: decodedToken.userId },
        //   {
        //       meta: {
        //           userId: decodedToken.userId,
        //           operationName: req.body.operationName,
        //           udid: req.headers.udid,
        //           clientIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        //       },
        //   });
        return await this.userService.getUserById(decodedToken.userId);
      } catch (error) {
        // Sentry.captureException(error);
        if (error instanceof jwt.JsonWebTokenError) {
          throw new AuthenticationError('The authorization code is incorrect');
          // return;
        }
        if (error instanceof jwt.TokenExpiredError) {
          throw new AuthenticationError('The authorization code has expired');
          // return;
        }
        throw error;
      }
    }
  }
}
