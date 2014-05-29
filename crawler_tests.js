Crawlers;
if (Crawler.Collection) {
  Crawlers = new Crawler.Collection('example_com');
  if (Meteor.isServer) {
    Meteor.publish('crawlers', function() {
      return Crawlers.find();
    });
    Crawlers.allow({
      insert: function() {
        return true;
      },
      update: function() {
        return true;
      },
      remove: function() {
        return true;
      }
    })
  }
}

Tinytest.add('Crawler - One can create new Crawler.Collection.', function(test) {
  test.isTrue(Crawler.Collection, 'Missing Crawler.Collection');
  test.isTrue(Crawlers, 'Cannot create a crawler collection');
  test.instanceOf(Crawlers, Crawler.Collection, 'Wrong instanceOf Collection');
});

Tinytest.add('Crawler - Meteor Collection API exists.', function(test) {
  test.equal(typeof Crawlers.insert, 'function', 'Missing function insert on collection.');
  test.equal(typeof Crawlers.find, 'function', 'Missing function find on collection.');
  test.equal(typeof Crawlers.findOne, 'function', 'Missing function findOne on collection.');
  test.equal(typeof Crawlers.update, 'function', 'Missing function update on collection.');
  test.equal(typeof Crawlers.remove, 'function', 'Missing function remove on collection.');
  test.equal(typeof Crawlers.upsert, 'function', 'Missing function upsert on collection.');
});

Tinytest.add('Crawler - One can create new crawlers in a collection.', function(test) {
  var count1 = Crawlers.find().count();
  var _id = Crawlers.insert({});

  test.isTrue(_id, 'Crawlers did not return an _id on insert.');
  test.equal(typeof _id, 'string', '_id is not a String');

  var count2 = Crawlers.find().count();
  test.equal(count1, count2 - 1, 'Crawler count is not as expected.');

  var count3 = Crawlers.find({_id: _id}).count();
  test.equal(count3, 1, 'Crawler does not exist as expected.');
});

testAsyncMulti('Crawler - One can consume a page.', [function(test, expect) {
  test.equal(typeof Crawlers.consume, 'function', 'Missing function consume on collection.');
  Crawlers.consume('http://example.com', expect(function(err, res) {
    test.isTrue(res, 'Result is empty.');
    test.equal(typeof res, 'object', 'Result is not a Object');
    test.equal(typeof res.content, 'string', 'Content is not a String');
  }));
}]);

if (Meteor.isServer) {
  testAsyncMulti('Crawler - Crawler can parse links from a page.', [function(test, expect) {
    test.equal(typeof Crawlers._parse, 'function', 'Missing function _parse on collection.');
    var responseContent;
    Crawlers.consume('http://example.com', expect(function(err, res) {
      responseContent = res.content;
    }));

    Crawlers._parse(responseContent, expect(function(err, links) {
      test.isTrue(links, 'Result is empty.');
      test.equal(typeof links, 'object', 'Result is not a Object');
      _.each(links, function(link) {
        test.equal(typeof link, 'object', 'Link is not an object, found on http://example.com.');
        test.equal(typeof link.name, 'string', 'We cought something else than links, found on http://example.com.');
        test.equal(link.name, 'a', 'Link is something else than a link, found on http://example.com.');
      });
    }));
  }]);


  testAsyncMulti('Crawler - Crawler can add pages to the Queue.', [function(test, expect) {
  }]);

  testAsyncMulti('Crawler - One can list pages from the Queue.', [function(test, expect) {
  }]);

  testAsyncMulti('Crawler - Crawler can start.', [function(test, expect) {
  }]);

  testAsyncMulti('Crawler - Crawler can stop.', [function(test, expect) {
  }]);

  testAsyncMulti('Crawler - Crawler can resume.', [function(test, expect) {
  }]);

  testAsyncMulti('Crawler - Crawler can run in different timeout.', [function(test, expect) {
  }]);

  testAsyncMulti('Crawler - Crawler can finish.', [function(test, expect) {
  }]);

  testAsyncMulti('Crawler - Crawler is never crawling pages twice.', [function(test, expect) {
  }]);

  testAsyncMulti('Crawler - Multiple crawlers can crawl pages simultanously and finish.', [function(test, expect) {
  }]);

}
