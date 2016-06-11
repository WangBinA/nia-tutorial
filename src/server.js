import ProjectCore from 'project-core';
import path from 'path';
import createDebug from 'debug';

const $ = global.$ = new ProjectCore();

$.createDebug = function (name) {
  return createDebug('my:' + name);
};
const debug = $.createDebug('server');

// console.log(process.env.NODE_ENV);

$.init.add((done) => {
  $.config.load(path.resolve(__dirname, 'config.js'));
  const env = process.env.NODE_ENV || null;
  if (env) {
    debug('load env: %s', env);
    $.config.load(path.resolve(__dirname, '../config', env + '.js'));
  }
  $.env = env;
  done();
});

$.init.load(path.resolve(__dirname, 'init', 'mongodb.js'));
$.init.load(path.resolve(__dirname, 'models'));

$.init.load(path.resolve(__dirname, 'init', 'express.js'));
$.init.load(path.resolve(__dirname, 'routes'));



$.init(function (err) {
  if (err) {
    console.error(err);
    process.exit(-1);
  } else {
    console.log('inited');
  }

  // // testing db connection
  // const item = $.model.User({
  //   name: `User${$.utils.date('Ymd')}`,
  //   password: '123456',
  //   nickname: '测试用户',
  // });
  // item.save(console.log);

});