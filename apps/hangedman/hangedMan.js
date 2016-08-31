var http = require('http');
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

function getQuestion(callback) {
    var selected, categ;
    request("http://jservice.io/api/category?id=" + categories[chosenCateg], function(err, resp, body) {
        if (!err && resp.statusCode === 200) {
            var json = JSON.parse(body);
            categ = json.title;
            console.log(json);
            selected = json.clues[Math.floor(Math.random() * json.clues.length)];
            console.log(selected);
            callback(formatQ(selected, categ));
        } else {
            console.log("error " + "http://jservice.io/api/category?id=" + categories[chosenCateg]);
            getQuestion();
        }
    });
}

function formatQ(q, title)
{
  var qObj = {
    category : title,
    question : q.question,
    answer : q.answer,
    points : q.value
  }
  console.log(qObj)
  return qObj;
}

getQuestion(function(returnedQ){
  console.log(returnedQ);
});
