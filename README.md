# Meteor-Crawler

A simple web-crawler built in Meteor.

## How to crawl (Client/Server).

    // Create a new Crawler Collection.
    Crawlers = new Crawler.Collection('example_com');

    // To create one or more crawlers, use Mongo Style Meteor Collection API.
    Crawlers.insert({});

    // Consume just one page (good for testing).
    Crawlers.consume('http://example.com');

    // Start Crawling a website.
    Crawlers.start('http://example.com');

    // Stop crawling.
    Crawlers.stop();

    // Resume crawling.
    Crawlers.resume();

    // Modify default timeout (1000ms).
    Crawlers.setTimeout(1000);

    // And yes, Meteor.Collection API works too.
    Crawlers.find();
    Crawlers.find().fetch();
    Crawlers.find().count();
    Crawlers.insert({});
    Crawlers.update({}, {$set: {}});
    Crawlers.remove({});

## The page queue (Client/Server).

    // Create a new Crawler Collection.
    Crawlers = new Crawler.Collection('example_com');

    // The Queue for a collection is accessible through the Meteor Cursor Queue on the collection.
    Crawlers.Queue.find();

    // The Queue is unique and indexed on url.
    // The Queue is sorted on timestamp when the crawlers are consuming it.
    // A page in the queue gets the attribute claim when being consumed by a crawler.
    // When a page is consumed the claim is removed and the done flag is set to true.
    // Raw content is saved on content attribute on a page (which is only accesible on the server).

## Create an observing feeder to an external API (server).

    // Create a new Crawler Collection.
    Crawlers = new Crawler.Collection('example_com');

    // Create a feeder to an external API.
    Crawlers.Queue.find().observe({
      changed: function(newDoc, oldDoc) {
        if (newDoc.done) {
          // This is up to you how you want to send the content to the external
          // API, but the raw content is accessible on newDoc.content;
          HTTP.post('http://external.com/api', {
            content: newDoc.content
          }, function(err, res) {
            if (!err) {
              console.log('sent: ' + newDoc.url);
            }
          });
        }
      }
    })
