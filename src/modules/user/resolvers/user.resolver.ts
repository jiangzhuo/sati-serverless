import { HttpException, Inject, Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { Permission } from '../../../common/decorators';
import { CommonResult } from '../../../common/interfaces';
// import { NotaddGrpcClientFactory } from '../../../grpc/grpc.client-factory';
import { AuthGuard } from '../auth/auth.guard';
import { LoggingInterceptor } from '../../../common/interceptors';
import { UserService } from "../services/user.service";
import { AuthService } from '../services/auth.service';

// import { __ as t } from 'i18n';

@Resolver()
@UseGuards(AuthGuard)
// @Resource({ name: 'user_manage', identify: 'user:manage' })
@UseInterceptors(LoggingInterceptor)
export class UserResolver {
  onModuleInit() {
    // this.userServiceInterface = this.notaddGrpcClientFactory.userModuleClient.getService('UserService');
  }

  constructor(
    @Inject(UserService) private readonly userService: UserService,
    @Inject(AuthService) private readonly authService: AuthService
    // @InjectBroker() private readonly userBroker: ServiceBroker,
    // @Inject(NotaddGrpcClientFactory) private readonly notaddGrpcClientFactory: NotaddGrpcClientFactory,
  ) {
  }

  private logger = new Logger('user');

  @Query('loginBySMSCode')
  async loginBySMSCode(req, body: { mobile: string, verificationCode: string }, context, resolveInfo): Promise<CommonResult> {
    // const { data } = await this.userBroker.call('user.loginBySMSCode', body,
    //     {
    //         meta: {
    //             udid: context.udid,
    //             operationName: context.operationName,
    //             clientIp: context.clientIp,
    //         },
    //     });

    const checkResult = this.authService.checkLoginVerificationCode(body.verificationCode, body.mobile);
    if (!checkResult) {
      // throw new RpcException({code: 406, message: t('Login by mobile failed')});
      throw new HttpException('Login by mobile failed', 406);
    }
    const user = await this.userService.loginByMobile(body.mobile);
    // if (!user) throw new RpcException({ code: 406, message: t('Login by mobile failed no user') });
    if (!user) throw new HttpException('Login by mobile failed no user', 406);
    const tokenInfo = this.authService.createToken({ userId: user.id });

    // tslint:disable-next-line:max-line-length
    this.logger.log(`${body && body.mobile}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(tokenInfo)}`);
    return { code: 200, message: 'success', data: tokenInfo };
  }

  @Query('loginByMobileAndPassword')
  async loginByMobileAndPassword(req, body: { mobile: string, password: string }, context, resolveInfo): Promise<CommonResult> {
    const userData = await this.userService.loginByMobileAndPassword(body.mobile, body.password);
    const tokenInfo = this.authService.createToken({ userId: userData.id });
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${body && body.mobile}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify({
      tokenInfo,
      userData
    })}`);
    return { code: 200, message: 'success', data: tokenInfo };
  }

  @Query('renewToken')
  @Permission('user')
  async renewToken(req, body, context, resolveInfo) {
    const userData = await this.userService.getUserById(body.userId);
    const tokenInfo = this.authService.createToken({ userId: body.userId });

    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify({
      tokenInfo,
      userData
    })}`);
    return { code: 200, message: 'success', data: tokenInfo };
  }

  @Mutation('registerBySMSCode')
  async registerBySMSCode(req, { registerUserInput, verificationCode }, context, resolveInfo): Promise<CommonResult> {
    const checkResult = this.authService.checkRegisterVerificationCode(verificationCode, registerUserInput.mobile);
    if (!checkResult) {
      throw new HttpException('Registration by mobile failed', 403);
    }
    let user = await this.userService.registerBySMSCode(registerUserInput);

    // tslint:disable-next-line:max-line-length
    this.logger.log(`${registerUserInput && registerUserInput.mobile}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(user)}`);
    return { code: 200, message: 'success', data: user };
  }

  @Query('sendLoginVerificationCode')
  async sendLoginVerificationCode(req, body, context, resolveInfo): Promise<CommonResult> {
    // const { data } = await this.userBroker.call('user.getLoginVerificationCode', body,
    //     {
    //         meta: {
    //             udid: context.udid,
    //             operationName: context.operationName,
    //             clientIp: context.clientIp,
    //         },
    //     });


    let verificationCode = this.authService.generateLoginVerificationCode(body.mobile);
    if (body.mobile.startsWith('13800138000')) {
      // return { data: verificationCode };
    } else {
      // todo SMS
      // let smsClient = new SMSClient({
      //   accessKeyId: process.env.SMS_ACCESS_KEY_ID,
      //   secretAccessKey: process.env.SMS_ACCESS_KEY_SECRET
      // });
      // await smsClient.sendSMS({
      //   PhoneNumbers: body.mobile,
      //   SignName: process.env.SMS_SIGN_NAME,
      //   TemplateCode: process.env.SMS_LOGIN_TEMPLATE_CODE,
      //   TemplateParam: `{"code":"${verificationCode}"}`
      // });
      // return { data: verificationCode };
    }

    // tslint:disable-next-line:max-line-length
    this.logger.log(`${body && body.mobile}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(verificationCode)}`);
    return { code: 200, message: 'success' };
  }

  @Query('sendRegisterVerificationCode')
  async sendRegisterVerificationCode(req, body, context, resolveInfo): Promise<CommonResult> {


    let verificationCode = this.authService.generateRegisterVerificationCode(body.mobile);
    if (body.mobile.startsWith('13800138000')) {
      // return { data: verificationCode };
    } else {
      // todo SMS
      // let smsClient = new SMSClient({
      //   accessKeyId: process.env.SMS_ACCESS_KEY_ID,
      //   secretAccessKey: process.env.SMS_ACCESS_KEY_SECRET
      // });
      // await smsClient.sendSMS({
      //   PhoneNumbers: body.mobile,
      //   SignName: process.env.SMS_SIGN_NAME,
      //   TemplateCode: process.env.SMS_REGISTER_TEMPLATE_CODE,
      //   TemplateParam: `{"code":"${verificationCode}"}`
      // });
      // return { data: verificationCode };
    }


    // tslint:disable-next-line:max-line-length
    this.logger.log(`${body && body.mobile}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(verificationCode)}`);
    return { code: 200, message: 'success' };
  }

  @Mutation('updateCurrentUser')
  @Permission('user')
  async updateCurrentUser(req, body, context, resolveInfo): Promise<CommonResult> {
    body.updateCurrentUserInput.id = context.user.id;

    let user = await this.userService.updateUser(context.user.id, body.updateCurrentUserInput);

    // const { data } = await this.userBroker.call('user.updateUserById', body.updateCurrentUserInput);
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(user)}`);
    return { code: 200, message: 'success', data: user };
  }

  @Mutation('updateUserById')
  @Permission('editor')
  async updateUserById(req, body, context, resolveInfo): Promise<CommonResult> {

    let user = await this.userService.updateUser(body.updateUserInput.id, body.updateUserInput);
    // const { data } = await this.userBroker.call('user.updateUserById', body.updateUserInput);
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(user)}`);
    return { code: 200, message: 'success', data: user };
  }

  @Query('getCurrentUser')
  @Permission('user')
  async getCurrentUser(req, body, context): Promise<CommonResult> {
    if (context.user) {
      return { code: 200, message: 'userInfo from context', data: context.user };
    } else {
      return { code: 401, message: 'no userInfo in context', data: {} };
    }
    // return await this.userBroker.call('user.updateCurrentUser',{ userId: context.user.id });
  }

  @Query('getUserById')
  @Permission('anony')
  async getUserById(req, body, context): Promise<CommonResult> {
    const user = await this.userService.getUserById(body.id);
    return { code: 200, message: 'success', data: user };
  }

  @Query('getUserByMobile')
  @Permission('editor')
  async getUserByMobile(req, body): Promise<CommonResult> {
    const user = await this.userService.getUserByMobile(body.mobile);
    return { code: 200, message: 'success', data: user };
  }

  @Query('getUser')
  @Permission('user')
  async getUser(req, body, context): Promise<CommonResult> {
    const user = await this.userService.getUser(body.first, body.after);
    return { code: 200, message: 'success', data: user };
  }

  @Query('searchUserAccount')
  @Permission('admin')
  async searchUserAccount(req, body, context): Promise<CommonResult> {
    const data = await this.userService.searchUserAccount(body.userId, body.page, body.limit, body.type);
    return { code: 200, message: 'success', data };
  }

  @Query('countUserAccount')
  @Permission('admin')
  async countUserAccount(req, body, context): Promise<CommonResult> {
    const data = await this.userService.countUserAccount(body.userId, body.type);
    return { code: 200, message: 'success', data };
  }

  @Query('searchUser')
  @Permission('admin')
  async searchUser(req, body, context): Promise<CommonResult> {
    const { total, data } = await this.userService.searchUser(body.keyword, (body.page - 1) * body.limit, body.limit);
    return { code: 200, message: 'success', data: { total, data } };
  }

  @Query('countUser')
  @Permission('admin')
  async countUser(req, body, context): Promise<CommonResult> {
    const total = await this.userService.countUser(body.keyword);
    return { code: 200, message: 'success', data: total };
  }

  @Mutation('changeBalanceByAdmin')
  @Permission('admin')
  async changeBalanceByAdmin(req, body: { userId: string, changeValue: number, extraInfo: string }, context, resolveInfo) {
    const user = await this.userService.changeBalance(body.userId, body.changeValue, 'changeByAdmin', JSON.stringify({
      operatorId: context.user.id,
      operatorExtraInfo: body.extraInfo
    }));
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(user)}`);
    return { code: 200, message: 'success', data: user };
  }
}
