var cheerio = Npm.require('cheerio');
var URL = Npm.require('url');

// Crawler.Collection = function(collection) {
//   return this;
// };
//
// Crawler.Collection.prototype = new Meteor.Collection();
// Crawler.Collection.constructor = Crawler.Collection;
var v = {};
_.extend(v, {
  consume: function(url) {
    var next = _next();
    if (!next) {
      this.stop();
    }
    else {
      console.log(this._id, 'consume: ' + next.url);
      // _consume(next.url);
    }
  },

  start: function(url) {
    console.log(this._id, 'started');

    var timestamp = (+new Date);
    PageQueue.upsert({url: this.url}, {$set: {
        collection: this.collection,
        claim: this._id,
        done: false,
        timestamp: timestamp
      }
    });

    this.resume();
  },

  stop: function() {
    console.log(this._id, 'stopped\n');
    Crawlers.upsert({_id: this._id}, {$set: {running: false}});
    this.running = false;
    console.log(this);
    Meteor.clearInterval(this.interval);
  },

  resume: function() {
    var self = this;
    this.consume();

    this.interval = Meteor.setInterval(function() {
      if (this.running) {
        self.consume();
      }
    }, this.timeout);
  }
});

var _next = function() {//done: false,
  PageQueue.findOne({claim: {$exists: false}}, {sort: {timestamp: -1}});
};

var _consume = function(url) {
  if (!url) {
    throw new Error('Missing url to consume');
  }

  if (!this.collection) {
    throw new Error('Missing collection on Crawler');
  }

  var responseContent;
  try {
    responseContent = HTTP.get(url, {
      query: '_escaped_fragment_=key=value'
    }).content;
  } catch (err) {
    console.log(err);
  }

  if (responseContent) {
    PageQueue.upsert({url: url}, {$set: {
      content: responseContent,
      done: true
    }, $unset: {
      claim: true
    }});
  } else {
    throw new Error(url + ' returned ' + responseContent);
  }

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
      console.log(href);
    }
  });
}

var _defaults = function() {
  return {
    _id: Meteor.uuid(),
    timeout: 1000
  };
}
