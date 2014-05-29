Crawlers = new Meteor.Collection('crawlers', {
  _preventAutopublish: true
});

PageQueue = new Meteor.Collection('pagequeue', {
  _preventAutopublish: true
});

Meteor.startup(function() {
  Crawlers.find().observe({
    added: function(doc) {
      new Crawler(doc);
    },
    removed: function(doc) {
      // console.log(crawlers);
    }
  });
});
