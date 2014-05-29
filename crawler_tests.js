// Tinytest.add('Crawler - new Crawler with same options returns same instance twice.', function(test) {
//   // Drop all data before the first test.
//   _.each(Crawler.instances.find().fetch(), function(doc) {
//     Crawler.instances.remove({_id: doc._id});
//   });
//
//   Crawler.crawlers = [];
//
//   var options1 = {_id: Meteor.uuid()};
//   var instance1 = new Crawler(options1);
//
//   var options2 = {_id: options1._id};
//   var instance2 = new Crawler(options2);
//
//   test.equal(instance2._id, instance1._id, '_id are not the same.');
//   test.equal(instance2, instance1, 'Instances are not the same.');
// });
//
// Tinytest.add('Crawler - new Crawler with different options returns different instances.', function(test) {
//   var instance1 = new Crawler({_id: Meteor.uuid()});
//   var instance2 = new Crawler({_id: Meteor.uuid()});
//
//   test.notEqual(instance2._id, instance1._id, '_id are the same.');
//   test.notEqual(instance2, instance1, 'Instances are the same.');
// });
if (Meteor.isServer) {
  Tinytest.add('Crawler - new Crawler with different options but same _id should update instance.', function(test) {
    var options1 = {_id: Meteor.uuid(), url: '1'};
    var instance1 = new Crawler(options1);

    test.equal(options1.url, instance1.url, 'Instance has not gotten the all options.');

    var options2 = {_id: options1._id, url: '2', collection: '1'};
    var instance2 = new Crawler(options2);

    test.equal(instance1.url, options2.url, 'Previous instance have not been updated.');
    test.equal(instance2.url, options2.url, 'New instance gets old values.');
    test.isNotNull(instance1.collection, 'Previous instances does not get updated.');

    var instance3 = new Crawler({_id: options1._id});

    test.equal(instance3.url, options2.url, 'New instance does not not get latest field values.');
    test.isNotNull(instance3.collection, 'New instance does not get latest field values.');
  });
}

// if (Meteor.isServer) {
//   Tinytest.add('Crawler - new Crawler gets into database on server.', function(test) {
//     var options = {_id: Meteor.uuid()};
//     var before = Crawler.instances.findOne(options);
//
//     // Check for non-existance before.
//     test.isUndefined(before, options._id + ' was found in the collection before.');
//
//     // Create a new crawler.
//     new Crawler(options);
//
//     var after = Crawler.instances.findOne(options);
//
//     // Check for existance in the database after.
//     test.isNotNull(after, options._id + ' was not found in the collection after.');
//
//   });
//
//   Meteor.methods({
//     'test/createCrawler': function(options) {
//       return new Crawler(options);
//     },
//     'test/existance': function(options) {
//       return Crawler.instances.findOne(options);
//     }
//   });
// }
//
// if (Meteor.isClient) {
//   var options = {_id: Meteor.uuid()};
//
//   testAsyncMulti('Crawler - new Crawler from server shows up in database on client.', [
//     function(test, expect) {
//       var exists = Crawler.instances.findOne(options);
//       test.isUndefined(exists, options._id + ' was not found in the client collection before.');
//
//       Meteor.call('test/createCrawler', options, expect(function(err, res) {
//         test.equal(res._id, options._id, '_id in server collection does not match the one passed in.');
//       }));
//     },
//     function(test, expect) {
//       Meteor.call('test/createCrawler', options, expect(function(err, res) {
//         test.equal(res._id, options._id, 'Options was not saved to database in the server.');
//       }));
//     },
//     function(test, expect) {
//       Meteor.subscribe('crawlers', expect(function() {
//         // Set up a subscription and wait for it.
//       }));
//
//       // Wait for some time for network latency.
//       Meteor.setTimeout(expect(function() {
//         var exists = Crawler.instances.findOne(options);
//         test.isTrue(exists, options._id + ' was not found in the client collection after a limited amount of time.');
//       }), 300);
//     }
//   ]);
// }
