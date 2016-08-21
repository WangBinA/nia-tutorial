const expect = require('chai').expect;
var request = require('request');

var defaultOpt = {
  baseUrl: 'http://127.0.0.1:33001/',
  jar: true
};

request = request.defaults(defaultOpt);


describe('topic', function () {

  var testTopic = {
    '_id': '57b91d645728945010953b4d',
    'title': 'Post 1',
    'content': 'This is Post 1',
    'author': '57b41eba773bbfcc12080f54',
    'comments': [
      {
        'author': '57b41eba773bbfcc12080f54',
        'content': 'This is comment of Post 1',
        '_id': '57b9266002cddcb8137d7682'
      }
      ],
    'tags': [ 'test' ],
    '__v': 0
  };

  before(function (done) {
    request('/test/resetdb', function (err) {
      if (err) {return done(err);}
      done();      
    });
  });

  before(function (done) {
    request.post({
      url: '/api/login',
      formData: {
        name: 'abcd',
        password: 'passabcd',
      },
      json: true
    }, function (err, res, data) {
      done();
    });
  });

  it('create topic', function (done) {
    request.post({
      url: '/api/topic/add',
      formData: {
        title: '哈哈哈哈',
        content: '瓦赫哈哈哈',
        tags: 'test',
      },
      json: true
    }, function (err, res, data) {
      expect(data.result.topic.title).to.equal('哈哈哈哈');
      expect(data.result.topic.content).to.equal('瓦赫哈哈哈');
      expect(data.result.topic.tags).to.have.members(['test']);
      done();
    });
  });

  it('list topic', function (done) {
    request.get({
      url: '/api/topic/list',
      json: true
    }, function (err, res, data) {
      expect(data.result.list.length).to.be.at.least(2);
      done();
    });
  });

  it('show topic item', function (done) {
    request.get({
      url: '/api/topic/item/' + testTopic._id,
      json: true
    }, function (err, res, data) {
      expect(data.result.topic.title).to.be.equal(testTopic.title);
      expect(data.result.topic.content).to.be.equal(testTopic.content);
      done();
    });
  });

  it('update topic item', function (done) {
    request.post({
      url: '/api/topic/item/' + testTopic._id,
      formData: {
        title: 'Post 1 Changed',
        content: 'This is Changed Post 1'
      },
      json: true
    }, function (err, res, data) {
      expect(data.result.topic.title).to.be.equal('Post 1 Changed');
      expect(data.result.topic.content).to.be.equal('This is Changed Post 1');
      done();
    });
  });

  it('add topic comment', function (done) {
    request.post({
      url: '/api/topic/item/' + testTopic._id + '/comment/add',
      formData: {
        content: 'This is comment 2 of Post 1'
      },
      json: true
    }, function (err, res, data) {
      expect(data.result.comment.ok).to.be.equal(1);
      done();
    });
  });

  it('delete topic comment', function (done) {
    request.post({
      url: '/api/topic/item/' + testTopic._id + '/comment/delete',
      formData: {
        cid: testTopic.comments[0]._id
      },
      json: true
    }, function (err, res, data) {
      expect(data.result.comment.content).to.be.equal(testTopic.comments[0].content);
      done();
    });
  });
    
});
