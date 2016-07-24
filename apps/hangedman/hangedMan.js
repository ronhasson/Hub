var http = require('http');
var q = require('q');
var request = require('request');

var categories = new Array();
categories["stupid"] = 136;
categories["american history"] = 750;
categories["animals"] = 21;
categories["3 letter"] = 105;
categories["science"] = 25;
categories["transportation"] = 103;
categories["us cities"] = 7;
categories["people"] = 442;
categories["television"] = 67;
categories["history"] = 114;
categories["bible"] = 31;
categories["food"] = 49;

var chosenCateg = "science";

var getClue = function() {
    var defered = q.defer();
    request("http://jservice.io/api/category?id="+categories[chosenCateg], function(err, resp, body) {
        if (!err && resp.statusCode === 200) {
            var json = JSON.parse(body);
            console.log(json);
            var selected = json.clues[Math.floor(Math.random() * json.clues.length)];
            console.log(selected);
            defered.resolve(selected[0]);
            console.log(json.length);
        }
        else {
          console.log("error " + "http://jservice.io/api/category?id="+categories[chosenCateg])
        }
    });
    return defered.promise;
}

var clue = getClue().then(function(myClue) {
    console.log(myClue);
    var clueid = myClue.id;
    var question = myClue.question;
    var category = myClue.category.title;
    var answer = myClue.answer;
});
