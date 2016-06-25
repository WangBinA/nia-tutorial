
import mongoose from 'mongoose';

module.exports = function (done) {
  const debug = $.createDebug('init:mongodb');
  debug('connecting to MongoDB ...');
  const conn = mongoose.createConnection($.config.get('db.mongodb'));
  debug('hello from mongodb.js');
  $.mongodb = conn;
  $.model = {};

  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;
  $.utils.ObjectId = ObjectId;

  done(); 
};