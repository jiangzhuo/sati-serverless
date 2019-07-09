const { Test } = require('@nestjs/testing');
import { createConnection } from 'typeorm';
import { UserEntity } from '../../src/entities';
// const { spawn } = require('child_process');

const _ = require('lodash');

module.exports = async (context) => {
  // Set reference to mongod in order to close the server during teardown.
  console.log('global setup');

  process.env['SENTRY_DSN'] = 'https://f788de537d2648cb96b4b9f5081165c1@sentry.io/1318216';
  process.env['HTTP_PORT'] = '5000';
  process.env['HTTPS_PORT'] = '442';
  process.env['LOG_LEVEL'] = 'warn';
  // tslint:disable-next-line:max-line-length
  process.env['WHITELIST_OPERATION_NAME'] = `["IntrospectionQuery", "sayHello", "test", "adminTest", "home", "getHome", "getHomeById", "getNew", "loginBySMSCode","loginByMobileAndPassword", "sendRegisterVerificationCode", "sendLoginVerificationCode", "registerBySMSCode"]`;
  process.env['AUTH_TOKEN_SECRET_KEY'] = 'secretKey';

  // const slsOfflineProcess = spawn('sls', ['offline', 'start']);
  //
  // console.log(`Serverless: Offline started with PID : ${slsOfflineProcess.pid}`);
  //
  // global['__slsOfflineProcess__'] = slsOfflineProcess;
  // return new Promise((resolve, reject) => {
  //   slsOfflineProcess.stderr.on('data', (errData) => {
  //     console.log(`Error starting Serverless Offline:\n${errData}`);
  //     reject(errData);
  //   });
  //
  //   slsOfflineProcess.stdout.on('data', (data) => {
  //     if (data.includes('Offline listening on')) {
  //       console.log(data.toString().trim());
  //       resolve();
  //     }
  //   });
  // });

  const connection = await createConnection({
    type: 'postgres',
    host: '127.0.0.1  ',
    port: 5432,
    username: 'postgres',
    password: 'wangzhe88',
    database: 'sati_test_home',
    entities: [
      UserEntity,
    ],
    dropSchema: true,
    synchronize: true,
    // logging: 'all',
    // logger: 'advanced-console',
  });

  const userRepository = connection.getRepository(UserEntity);

  const newUser1 = userRepository.create({
    username: 'testuser1',
    mobile: '13800138000',
    password: '$2a$10$GHG8D.Z8.xjsiy71RfhQu.tCwx/Bld6vqjj6nD6eyom8bhMmsIr3m',
    nickname: 'admin',
    avatar: 'http://sati-test.oss-cn-beijing.aliyuncs.com/avatar/addf9ce0-baff-11e8-90cc-b70dad818327.jpg',
    status: 0,
    balance: 0.0,
    role: 2047.0,
  });

  await userRepository.save(newUser1);

  const newUser2 = userRepository.create({
    username: 'testuser2',
    mobile: '2',
    password: '$2a$10$fQyMSm8LZEqP7oneKyYm1eeyuuVi1FmNexIRwMT8OmEiMKevmTimG',
    nickname: 'jiangzhuo',
    avatar: 'http://sati-test.oss-cn-beijing.aliyuncs.com/avatar/addf9ce0-baff-11e8-90cc-b70dad818327.jpg',
    status: 0,
    balance: 0.0,
  });

  await userRepository.save(newUser2);

  const newUser3 = userRepository.create({
    username: 'testuser3',
    mobile: '3',
    password: '$2a$10$OhZyFQJp354UXgLxG/EAL.W5YFYAA2M45hjREc3xSYVyF/ubhpuOC',
    nickname: '半个月亮没消息',
    avatar: 'http://sati-test.oss-cn-beijing.aliyuncs.com/avatar/addf9ce0-baff-11e8-90cc-b70dad818327.jpg',
    status: 0,
    balance: 0.0,
  });

  await userRepository.save(newUser3);

  const newUser4 = userRepository.create({
    username: 'testuser4',
    mobile: '4',
    password: '$2a$10$Ok2PjqyMABrcQtp/QlG0RuZiF1hljZKA3FisZJPwcncdGPsT/jfSG',
    nickname: '正月十五月亮圆',
    avatar: 'http://sati-test.oss-cn-beijing.aliyuncs.com/avatar/addf9ce0-baff-11e8-90cc-b70dad818327.jpg',
    status: 0,
    balance: 0.0,
  });

  await userRepository.save(newUser4);

  const newUser5 = userRepository.create({
    username: 'testuser5',
    mobile: '5',
    password: '$2a$10$Ok2PjqyMABrcQtp/QlG0RuZiF1hljZKA3FisZJPwcncdGPsT/jfSG',
    nickname: '正月十五月亮圆',
    avatar: 'http://sati-test.oss-cn-beijing.aliyuncs.com/avatar/addf9ce0-baff-11e8-90cc-b70dad818327.jpg',
    status: 0,
    balance: 0.0,
  });

  await userRepository.save(newUser5);

  await connection.close();
};
