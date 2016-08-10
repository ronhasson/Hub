files = {
	"/": ["/remoteMainPage.html"],
	"/tos": ["/apps/townofsalem/tos_remote.html"],
	"/tosRoles": ["/apps/townofsalem/roles.js"],
};
expr = null;
function init(expr_lib)
{
	if (!expr_lib) {
		// generate error
		return;
	}
	expr = expr_lib;
}
function load_files() {
	func = function(req, res) {
				for (var file in files[key])
    				res.sendFile(__dirname + file);
			};
	for	(var key in files)
		if (files.hasOwnProperty(key))
			expr.get(key, func);
}