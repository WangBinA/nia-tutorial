module.exports = function (done) {
  $.router.get('/', function (req, res, next) {
    res.end(`Hello guest. ${new Date}`);
  });
  done();
};