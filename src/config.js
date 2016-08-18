'use strict';

/**
 * pratice Node.js project
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (set, get, has) {

  // session secret
  set('web.session.secret', 'test');

  // session redis connection
  set('web.session.redis', {
    host: '192.168.56.101',
    port: 6379,
  });

  // limiter redis connection
  set('limiter.redis', {
    host: '192.168.56.101',
    port: 6379,
    prefix: 'L:',
  });

  // captcha redis connection
  set('captcha.redis', {
    host: '192.168.56.101',
    port: 6379,
    prefix: 'C:',
  });

};
