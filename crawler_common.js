Crawlers = new Meteor.Collection('crawlers', {
  _preventAutopublish: true
});

PageQueue = new Meteor.Collection('pagequeue', {
  _preventAutopublish: true
});
