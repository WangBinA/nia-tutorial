import path from 'path';
import express from 'express';
import serveStatic from 'serve-static';
import bodyParser from 'body-parser';
import multiparty from 'connect-multiparty';
import session from 'express-session';

module.exports = function (done) {
  const debug = $.createDebug('init:express');
  debug('initing express');
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(multiparty());
  app.use(session({
    secret: $.config.get('web.session.secret'),
  }));

  const router = express.Router();
  const routerWrap = {};
  ['get', 'head', 'post', 'put', 'del', 'delete'].forEach(function (method) {
    routerWrap[method] = function (path, ...fnList) {
      fnList = fnList.map(function (fn, i) {
        if (typeof fn !== 'function') {
          throw new TypeError(`handler ${i} of "${method} ${path}" is not a function`);
        }
        return function (req, res, next) {
          const ret = fn(req, res, next);
          if (ret && ret.catch) {ret.catch(next);}
        };
      });
      router[method](path, ...fnList);
    };
  });

  $.router = routerWrap;

  app.use(function apiSuccessMW(req, res, next) {
    res.apiSuccess = function apiSuccess(data) {
      res.json({success: true, result: data});
    };
    next();
  });

  app.use(router);
  app.use('/static', serveStatic(path.resolve(__dirname, '../../static')));

  app.use('/api', function (err, req, res, next) {
    debug('API error: %s', err && err.stack || err);
    res.json({error: err.toString()});
  });
  
  app.listen($.config.get('web.port'), function (err) {
    console.log('server listening port ', $.config.get('web.port'));
    done(err);
  });
  // done();
};