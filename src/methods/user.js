import validator from 'validator';

module.exports = function (done) {
  const debug = $.createDebug('init:method');
  debug('initing methods from user.js');

  $.method('user.add').check({
    name: {
      required: true, 
      validate: function (v) {
        return validator.isLength(v, {min: 4, max: 20}) && /^[a-zA-Z]/.test(v);
      }
    },
    email: {
      required: true,
      validate: function (v) {
        return validator.isEmail(v);
      }
    },
    password: {
      required: true, 
      validate: function (v) {
        return validator.isLength(v, {min: 6});
      }
    },
  });

  $.method('user.add').register(async function (params) {
    if (!params.name) {
      throw new Error(`missing user name`);
    }
    params.name = params.name.toLowerCase();
    {
      const usr = await $.method('user.get').call({name: params.name});
      console.log(usr);
      if (usr) {
        throw new Error(`user ${params.name} already exists`);
      }
    }
    var usr;
    usr = await $.method('user.get').call({email: params.email});
    if (usr) {
      new Error(`user ${params.email} already exists`);
    }
    params.password = $.utils.encryptPassword(params.password.toString());
    usr = new $.model.User(params);
    return usr.save();
  });

  $.method('user.get').check({
    _id: {
      validate: function (v) {
        return validator.isMongoId(v);
      }
    },
    name: {
      validate: function (v) {
        return validator.isLength(v, {min: 4, max: 20}) && /^[a-zA-Z]/.test(v);
      }
    },
    email: {
      validate: function (v) {
        return validator.isEmail(v);
      }
    },
  });

  $.method('user.get').register(async function (params) {
    var query = {};
    if (params._id) {
      query._id = params._id;
    } else if (params.name) {
      query.name = params.name;
    } else if (params.email) {
      query.email = params.email;
    } else {
      throw new Error('missing parameter _id|name|email');
    }
    console.log('query', query);

    // console.log('query', query);
    return $.model.User.findOne(query);
  });

  $.method('user.update').check({
    _id: {
      validate: function (v) {
        return validator.isMongoId(v);
      }
    },
    name: {
      validate: function (v) {
        return validator.isLength(v, {min: 4, max: 20}) && /^[a-zA-Z]/.test(v);
      }
    },
    email: {
      validate: function (v) {
        return validator.isEmail(v);
      }
    },
  });

  $.method('user.update').register(async function (params) {
    var user = await $.method('user.get').callback(params);
    if (!user) {
      throw new Error('user does not exists');
    }
    var update = {};
    if (params.name && user.name !== params.name) {update.name = params.name;}
    if (params.email && user.email !== params.email) {update.email = params.email;}
    if (params.password) {update.password = params.password;}
    if (params.nickname) {update.nickname = params.nickname;}
    if (params.about) {update.about = params.about;}

    return $.model.User.update({_id: user._id}, {$set: update});

  });


  done();

};