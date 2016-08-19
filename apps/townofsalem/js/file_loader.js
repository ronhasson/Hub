files = {
    "/": ["/remoteMainPage.html"],
    "/tos": ["/apps/townofsalem/tos_remote.html"],
    "/tosRoles": ["/apps/townofsalem/roles.js"]
};
var expr = null;
var init = function init(expr_lib) {
    if (!expr_lib) {
        console.log("expr not found"); // generate error
        return;
    }
    expr = expr_lib;
};
var load_files = function load_files() {
    var func = function(req, res) {
        for (var file in files[key])
            res.sendFile(__dirname + file);
    };
    for (var key in files)
        if (files.hasOwnProperty(key))
            expr.get(key, func);
};


module.exports = {
    init: init,
    load_files: load_files
};
