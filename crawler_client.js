Crawler = function(options) {
  // Some kind of singelton pattern going on.
  Crawler.crawlers = Crawler.crawlers || [];
  var self = this;
  _.extend(self, options || {});

  var instance = _.findWhere(Crawler.crawlers, {_id: options._id});
  if (!instance) {
    Crawler.crawlers.push(self);
    instance = self;
  }
  _.extend(instance, options || {});

  return instance;
}

Crawler.queue = PageQueue;
Crawler.instances = Crawlers;

// Stop all crawlers.
Crawler.stop = function() {
  for (var i in crawlers) {
    var crawler = Crawler.crawlers[i];
    crawler.stop();
  }
}

Crawler.prototype.start = function(url, collection) {
  Crawlers.update({_id: this._id}, {$set: {
    url: url,
    collection: collection,
    running: true
  }});
}

Crawler.prototype.resume = function() {
  Crawlers.update({_id: this._id}, {$set: {
    running: true
  }});
}

Crawler.prototype.stop = function() {
  Crawlers.update({_id: this._id}, {$set: {
    running: false
  }});
}
