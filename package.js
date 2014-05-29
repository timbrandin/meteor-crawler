Package.describe({
  summary: "A simple web-crawler."
});

Npm.depends({"cheerio": "0.16.0"});

Package.on_use(function (api, where) {
  api.use(['http', 'underscore']);

  api.add_files('crawler_common.js', ['client', 'server']);
  api.add_files('crawler_server.js', 'server');
  api.add_files('crawler_client.js', 'client');

  api.export('Crawler');
});

Package.on_test(function (api) {
  api.use(['tinytest', 'test-helpers', 'crawler']);

  api.add_files('crawler_tests.js', ['client', 'server']);
});
