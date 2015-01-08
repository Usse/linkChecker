var colorize = require('colorize');

var app = {
  version : '0.1',
  appName : 'app.js',
  links : [],
  isWeb : false,

  init : function() {
    app.showWelcome();
    app.checkParams();
  },

  showWelcome : function() {
    console.log('Link Checker v', + app.version);
  },

  checkParams : function() {
    if(process.argv.length < 3) {
      console.log('[ERROR] - Usage: node ' + app.appName + ' <filename>');
    } else {
      if(process.argv[2].indexOf("http://") >= 0) {
        app.isWeb = true;
      }else {
        app.isWeb = false;
      }
      app.parseFile(process.argv[2]);
    }
  },

  parseFile: function(fileName) { 
    if(app.isWeb) {
      var request = require('request')
      request(fileName, function (error, response, body) {
        var jsdom = require('jsdom');
        jsdom.env({
          html :  body, 
          scripts : ['http://code.jquery.com/jquery.js'],
          done : 
            function(errors, window) {
              var $ = window.$;
              $('a').each(function() {
                app.links.push($(this).prop('href'));
              })
              app.doCalls();
            }
        });
      });
    } else {
      app.fs = require('fs');
      app.fs.readFile(fileName, 'utf8', function(err, data) {
        var jsdom = require('jsdom');
        jsdom.env({
          html :  data, 
          scripts : ['http://code.jquery.com/jquery.js'],
          done : 
            function(errors, window) {
              var $ = window.$;
              $('a').each(function() {
                app.links.push($(this).prop('href'));
              })
              app.doCalls();
            }
        });
      });
    }
  },

  doCalls : function() {
    var request = require('request')
    //app.printFoundLinks();
    app.links.forEach(function(item) {
      if(item.indexOf('file:///') != -1) {
        colorize.console.log("#blue[UNK] - " + item + "");
      }else {
        request(item, function (error, response, body) {
          if (!error) {
            if(response.statusCode == 200) {
              colorize.console.log("#green[" + response.statusCode + "] - " + item + "");
            } else {
              colorize.console.log("#yellow[" + response.statusCode + "] - " + item + "");
            }
          } else {
            colorize.console.log("#red[ERR] - " + item + "");
          }
        });
      }

    }); 
  },

  printFoundLinks : function() {
    var lnum = app.links.length;
    console.log('Found ' + lnum + ' links\n');
    if(lnum > 0) {
      app.links.forEach(function(item) {
        console.log(item);
      })
    }
  }


}


app.init();
