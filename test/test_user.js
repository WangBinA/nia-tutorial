const expect = require('chai').expect;
var request = require('request');

var defaultOpt = {
  baseUrl: 'http://127.0.0.1:33001/',
  jar: true
};

request = request.defaults(defaultOpt);

describe('user', function () {

  var testUser = {
    '_id': '57b41eba773bbfcc12080f54',
    'name': 'abcd',
    'password': 'passabcd',
    'email': 'abcd@test.com',
    'nickname': 'abcd',
    'about': 'test user abcd',
    'githubUsername': 'githubabcd'
  };

  var updateUser = {
    'name': 'abcd',
    'password': 'passabcd',
    'email': 'abcd@test.com',
    'nickname': 'abcd',
    'about': 'test user abcd',
    'githubUsername': 'githubabcd'
  };

  var testNotif = { 
    '_id': '57b928a9ffefc88c0260f4e8', 
    'isRead': false,
    'createdAt': Date.now(), 
    'from': '57b41eba773bbfcc12080f54', 
    'to': '57b41eba773bbfcc12080f54', 
    'type': 'topic_comment', 
    'data': {
      'title': 'Post 1', 
      '_id': '57b91d645728945010953b4d'
    }, 
    '__v': 0 
  };

  before(function (done) {
    request('/test/resetdb', function (err) {
      if (err) {return done(err);}
      done();      
    });
  });

  beforeEach(function (done) {
    request.post({
      url: '/api/login',
      formData: {
        name: testUser.name,
        password: testUser.password,
      },
      json: true
    }, function (err, res, data) {
      if (err) {return done(err);}
      done();
    });
  });

  it('signup fail', function (done) {

    request.post({url: '/api/signup', formData: {name: 'test1', password: '12345678'}}, function (err, res, body) {
      expect(body).to.equal(JSON.stringify({error: 'email: missing parameter "email"'}));
      done();
    });
  });

  it('signup succeed', function (done) {

    request.post({
      url: '/api/signup',
      formData: {
        name: 'test1',
        password: '123456789',
        email: 'test1@example.com',
      },
      json: true
    }, function (err, res, data) {
      expect(data.result.user.name).to.equal('test1');
      expect(data.result.user.email).to.equal('test1@example.com');
      done();
    });
  });

  it('login', function (done) {

    request.post({
      url: '/api/login',
      formData: {
        name: 'test1',
        password: '123456789',
      },
      json: true
    }, function (err, res, data) {
      expect(data.result.token).to.be.a('string');
      done();
    });
  });

  it('login_user', function (done) {
    
    request.get({
      url: '/api/login_user',
      json: true
    }, function (err, res, data) {
      expect(data.result.user).to.contain.all.keys(['_id', 'name', 'email']);
      expect(data.result).to.contain.all.keys(['token']);
      done();
    });
  });

  it('logout fail', function (done) {
    
    request.get({
      url: '/api/logout',
      // formData: {
      //   name: 'test1',
      //   password: '123456789',
      // },
      json: true
    }, function (err, res, data) {
      expect(data.error).to.equal('Error: invalid token');
      done();
    });
  });

  it('logout succeed', function (done) {
    
    request.get({
      url: '/api/login_user',
      json: true
    }, function (err, res, data) {
      request.get({
        url: '/api/logout',
        qs: {
          token: data.result.token,
        },
        json: true
      }, function (err, res, data) {
        expect(data.success).to.equal(true);
        done();
      });

    });
  });

  it('profile', function(done) {
    request.post({
      url: '/api/user/profile',
      formData: {
        email: updateUser.email,
        nickname: updateUser.nickname,
        about: updateUser.about
      },
      json: true
    }, function (err, res, data) {
      expect(data.result).to.have.property('email', updateUser.email);
      expect(data.result).to.have.property('nickname', updateUser.nickname);
      expect(data.result).to.have.property('about', updateUser.about);
      done();
    });
  });

  it('request_reset_password fail', function(done) {
    request.post({
      url: '/api/user/request_reset_password',
      formData: {
        email: 'notexist@efgh.efgh',
      },
      json: true
    }, function (err, res, data) {
      expect(data).to.have.property('error', 'Error: user notexist@efgh.efgh does not exists');
      done();
    });
  });

  xit('request_reset_password succeed', function(done) {
    request.post({
      url: '/api/user/request_reset_password',
      formData: {
        email: updateUser.email,
      },
      json: true
    }, function (err, res, data) {
      expect(data.result).to.have.property('email', updateUser.email);
      done();
    });
  });

  it('reset_password', function(done) {
    missingemail();

    function missingemail() {
      request.post({
        url: '/api/user/reset_password',
        formData: {
          code: 'wrongcode',
          password: 'passefgh'
        },
        json: true
      }, function (err, res, data) {
        expect(data).to.have.property('error', 'Error: missing parameter `email`');
        missingcode();
      });
    }

    function missingcode() {
      request.post({
        url: '/api/user/reset_password',
        formData: {
          email: updateUser.email,
          password: 'passefgh'
        },
        json: true
      }, function (err, res, data) {
        expect(data).to.have.property('error', 'Error: missing parameter `code`');
        missingpassword();
      });
    }

    function missingpassword() {
      request.post({
        url: '/api/user/reset_password',
        formData: {
          email: updateUser.email,
          code: 'wrongcode'
        },
        json: true
      }, function (err, res, data) {
        expect(data).to.have.property('error', 'Error: missing parameter `password`');
        invalidcode();
      });
    }

    function invalidcode() {
      request.post({
        url: '/api/user/reset_password',
        formData: {
          code: 'wrongcode',
          email: updateUser.email,
          password: 'passefgh'
        },
        json: true
      }, function (err, res, data) {
        expect(data).to.have.property('error', 'Error: invalid captcha code wrongcode');
        done();
      });
    }

  });

  it('unbind github', function(done) {
    request.post({
      url: '/api/user/unbindoa',
      formData: {
        unbindGithub: 'anything',
      },
      json: true
    }, function (err, res, data) {
      expect(data.result).to.have.property('unbindGithub', true);
      done();
    });
  });

  it('notification count', function(done) {
    request.get({
      url: '/api/notification/count',
      json: true
    }, function (err, res, data) {
      expect(data.result.count).to.be.at.least(1);
      done();
    });
  });

  it('notification list', function(done) {
    request.get({
      url: '/api/notification/list',
      json: true
    }, function (err, res, data) {
      expect(data.result.list[0]._id).to.equal(testNotif._id);
      done();
    });
  });

  it('notification read', function(done) {
    request.post({
      url: '/api/notification/' + testNotif._id + '/read',
      json: true
    }, function (err, res, data) {
      expect(data.result.ok).to.equal(1);
      done();
    });
  });

});


