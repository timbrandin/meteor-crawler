Crawler = {};
Crawler.Collection = function(collection){
  Meteor.Collection.apply(this, arguments);
  this.Queue = new Meteor.Collection(collection + '_queue');
};

Crawler.Collection.prototype = Object.create(Meteor.Collection.prototype);
Crawler.Collection.prototype.constructor = Crawler.Collection;

_.extend(Crawler.Collection.prototype, {
  consume: function(url, callback) {
    Meteor.call('crawler/consume', url, this._name, callback);
  },
  stop: function() {
    this.update({}, {$set: {running: false}}, {multi: true});
  }
});
