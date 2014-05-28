# Meteor-Crawler

A simple web-crawler built in Meteor.

## How to crawl

Create an instance

    var crawler = new Crawler('example_com');

    // The crawler does always need a collection.
    crawler.consume('http://example.com');
