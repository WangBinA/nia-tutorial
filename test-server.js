// set NODE_ENV=dev && set DEBUG=my:* 
process.env.NODE_ENV = 'dev,test';
process.env.DEBUG = 'my:*';

require('./target/server');

process.nextTick(function () {

  const ObjectId = $.utils.ObjectId;

  var collection = {
    users: [
      {
        '_id': ObjectId('57b41eba773bbfcc12080f54'),
        'name': 'abcd',
        'password': '0E:96018EE71042854C0883DF3C9D82C664:01',
        'email': 'abcd@test.com',
        '__v': 0,
        'score': 16,
        'nickname': 'abcd',
        'about': 'test user abcd',
        'githubUsername': 'githubabcd',
      }
      ],
    topics: [
      {
        '_id': ObjectId('57b91d645728945010953b4d'),
        'createdAt': Date.now(),
        'title': 'Post 1',
        'content': 'This is Post 1',
        'author': ObjectId('57b41eba773bbfcc12080f54'),
        'comments': [
          {
            'author': ObjectId('57b41eba773bbfcc12080f54'),
            'content': 'This is comment of Post 1',
            'createdAt': Date.now(),
            '_id': ObjectId('57b9266002cddcb8137d7682')
          }
          ],
        'tags': [ 'test' ],
        '__v': 0
      }
      ],
    notifications: [
      { 
        '_id': ObjectId('57b928a9ffefc88c0260f4e8'), 
        'isRead': false,
        'createdAt': Date.now(), 
        'from': ObjectId('57b41eba773bbfcc12080f54'), 
        'to': ObjectId('57b41eba773bbfcc12080f54'), 
        'type': 'topic_comment', 
        'data': {
          'title': 'Post 1', 
          '_id': '57b91d645728945010953b4d'
        }, 
        '__v': 0 
      }
      ],
  };

  $.router.get('/test/resetdb', function (req, res, next) {

    new Promise(function (resolve, reject) {
      
      $.limiter.connection.keys($.config.get('limiter.redis.prefix') + '*', (err, keys) => {
        if (err) {return reject(err);}
        if (keys.length > 0) {
          $.limiter.connection.del(keys, resolve);
        } else {
          resolve();
        }
      });

    }).then(function () {
      
      console.log('limiter.redis.prefix removed.');

      return new Promise(function (resolve, reject) {
        
        $.captcha.connection.keys($.config.get('captcha.redis.prefix') + '*', (err, keys) => {
          if (err) {return reject(err);}
          if (keys.length > 0) {
            $.captcha.connection.del(keys, resolve);
          } else {
            resolve();
          }
        });
      });

    }).then(function () {
      
      console.log('captcha.redis.prefix removed.');

      return new Promise(function (resolve, reject) {
        
        // 清空MongoDB数据库
        $.mongodb.db.dropDatabase(function (err, result) {
          if (err) {return reject(err);}
          resolve(result);
        });
        
      });

    }).then(function () {

      console.log('mongodb reset');
      
      var promises = [];

      for (const name in collection) {
        promises.concat(
                collection[name].map(function (el) {
                  return new Promise(function (resolve, reject) {
                    $.mongodb.db.collection(name).save(el, null, function (err, result) {
                      if (err) {return reject(err);}
                      resolve(result);
                    });
                  });
                }));
      }
      return Promise.all(promises);
      
    }).then(function () {

      res.apiSuccess('test db initiated.');      

    }).catch(function (error) {
      
      if (error) {next(error);}

    });

  });
  
});

