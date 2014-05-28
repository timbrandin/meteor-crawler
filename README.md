# Meteor-Crawler

A simple web-crawler built in Meteor.

## How to crawl

Create an instance

    // The crawler does always need a collection.
    var crawler = new Crawler('example_com');

    // Consume some website.
    crawler.consume('http://example.com');
