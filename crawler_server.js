var cheerio = Npm.require("cheerio");
var URL = Npm.require("url");
var Future = Npm.require("fibers/future");

_.extend(Crawler.Collection.prototype, {
  _parse: function(content, callback) {
    Meteor.call('crawler/parse', content, callback);
  }
});

Meteor.methods({
  'crawler/consume': function(url, collection) {
    return _consume.call(this, url, collection);
  },
  'crawler/parse': function(content) {
    return _parse.call(this, content);
  }
});

var _next = function() {//done: false,
  PageQueue.findOne({claim: {$exists: false}}, {sort: {timestamp: -1}});
};

var _consume = function(url, collection) {
  var fut = new Future();
  this.unblock();

  if (!url) {
    throw new Error('Missing url to consume');
  }

  HTTP.get(url, {
      query: '_escaped_fragment_=key=value'
    }, function(err, res) {
      if (err) {
        fut.throw('Something went wrong: ' + err.message);
      }
      else {
        fut.return(res);
      }
    }
  );

  return fut.wait();
}

var _parse = function(responseContent) {
  var fut = new Future();
  this.unblock();

  (function() {
    $ = cheerio.load(responseContent);
    var links = $('a');
    _.each(links, function(link) {
      var $link = $(link);
      var href = $link.attr('href');
      if (href) {
        if (!/http[s]?:\/\//i.test(href)) {
          href = Meteor.absoluteUrl(href.replace(/^\//, ''), {
            rootUrl: url
          });
        }
      }
    });
    fut.return(links);
  })();

  return fut.wait();
}

var _defaults = function() {
  return {
    _id: Meteor.uuid(),
    timeout: 1000
  };
}
