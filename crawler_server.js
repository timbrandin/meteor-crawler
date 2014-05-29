var cheerio = Npm.require('cheerio');
var URL = Npm.require('url');

Meteor.startup(function() {
  PageQueue._ensureIndex('url', {
    index: true,
    unique: true,
    dropDups: true
  });

  // Create a crawler if it doesn't exist.
  if (Crawlers.find().count() == 0) {
    var initalCrawler = new Crawler();
  }

  Crawlers.find().observe({
    changed: function(doc) {
      // console.log(doc, 'hej');
      var crawler = new Crawler(doc);
      // if (crawler.running) {
      //   crawler.start();
      // }
      // else {
      //   crawler.stop();
      // }
    }
  })
});

Meteor.methods({
  'hej': function(doc) {
    return new Crawler(doc);
  }
})

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
  // Some kind of singelton pattern going on.
  Crawler.crawlers = Crawler.crawlers || [];
  var self = this;

  var instance;

  // When passing no _id, one will always get a new Crawler.
  if (options && options._id) {
    // console.log(options._id);
    instance = _.findWhere(Crawler.crawlers, {_id: options._id});
    console.log('found', instance);
  }

  // Add the instance of the Crawler to the list of crawlers.
  if (!instance) {
    instance = self;
    // _.extend(instance, _defaults(), options || {});
    Crawler.crawlers.push(instance);

    console.log('added self', instance);
    console.log(Crawler.crawlers);
  }


  _.extend(instance, _defaults(), options || {});

  console.log(instance);

  var fields = self;

  // Find the keys for all functions in this.
  var functions = _.reject(_.map(fields, function(value, key) {
    return _.isFunction(value) ? key : null;
  }), _.isNull);

  // Omit all functions of this object.
  fields = _.omit(fields, functions);

  // Update database with the new options or defaults.
  Crawlers.upsert({_id: instance._id}, fields);

  return instance;
};

// XXX Remove when done testing.
Meteor.methods({
  'createCrawler': function(options) {
    return new Crawler(options);
  }
});

// Public static - expose the collections.
Crawler.queue = PageQueue;
Crawler.instances = Crawlers;

_.extend(Crawler.prototype, {
  consume: function(url) {
    var next = this.next();
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
  },

  next: function() {//done: false,
    PageQueue.findOne({claim: {$exists: false}}, {sort: {timestamp: -1}});
  }
});

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
