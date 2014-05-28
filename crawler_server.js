var cheerio = Npm.require('cheerio');
var URL = Npm.require('url');
var crawlers = [];

Meteor.startup(function() {
  Crawlers.find().observe({
    added: function(doc) {
      crawlers.push(new Crawler(doc));
    },
    removed: function(doc) {
      console.log(crawlers);
    }
  });

  if (Crawlers.find().count() == 0) {
    var initalCrawler = new Crawler();
    Crawlers.insert(initalCrawler);
  }

  PageQueue._ensureIndex('url', {
    index: true,
    unique: true,
    dropDups: true
  });
});

Meteor.publish('crawlers', function() {
  return Crawlers.find();
});

Meteor.publish('pagequeue', function(collection) {
  PageQueue.find({collection: collection}, {
    fields: {
      url: true,
      done: true,
      timestamp: true
    }
  });
});

Crawler = function(options) {
  _.extend(this, _defaults(), options || {});
  Crawlers.upsert({_id: this._id}, {$set: this});
  return this;
};

_.extend(Crawler.prototype, {
  get: function(id) {
    return crawlers[id];
  },

  consume: function(url) {
    if (!url) {
      throw new Error('Missing url to consume');
    }

    if (!this.collection) {
      throw new Error('Missing collection on Crawler');
    }

    var timestamp = (+new Date);
    PageQueue.upsert({url: url}, {$set: {
        collection: this.collection,
        claim: this._id,
        done: false,
        timestamp: timestamp
      }
    });

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
  },

  begin: function(url) {
    var self = this;
    self.consume(url);

    Meteor.setInterval(function() {
      var next = self.next();
      self.consume(next.url);
    }, self.timeout);
  },

  next: function() {
    PageQueue.findOne({done: false, claim: {$exists: false}}, {sort: {timestamp: -1}});
  }
});

var _defaults = function() {
  return {
    _id: Meteor.uuid(),
    timeout: 1000
  };
}
