/*global $,async*/

(function() {
	var form = $('#search');

	function permuteConstructor(data) {
		var permute = {};

		var opts = {
			firstName: ['full', 'initial'],
			lastName: ['full', 'initial'],
			reverse: [true, false],
			delimiter: ['-', '_', '.', '']
		};

		var formatter = {
			full: function(str) {
				return str;
			},
			initial: function(str) {
				return str[0];
			}
		};

		function fmt(n1, d, n2, domain) {
			return n1 + d + n2 + '@' + domain;
		};

		function permutation(spec) {
			return function(cb) {
				var first = formatter[spec.firstName](data.first);
				var second = formatter[spec.lastName](data.last);

				if(spec.reverse) {
					var tmp = first;

					first = second;
					second = tmp;
				}

				cb(null, fmt(first, spec.delimiter, second, data.domain));
			};
		}
		
		function cartesian() {
			var r = [], arg = arguments, max = arg.length-1;
			function helper(arr, i) {
				for (var j=0, l=arg[i].length; j<l; j++) {
					var a = arr.slice(0);
					a.push(arg[i][j]);
					if (i==max)
						r.push(a);
					else
						helper(a, i+1);
				}
			}
			helper([], 0);
			return r;
		}

		permute.fns = function() {
			var perms = cartesian(opts.firstName, opts.lastName, opts.reverse, opts.delimiter);
			
			return perms.reduce(function(arr, perm) {
				var spec = {
					firstName: perm[0],
					lastName: perm[1],
					reverse: perm[2],
					delimiter: perm[3]
				};

				arr.push(permutation(spec));

				return arr;
			},[]);
		};

		return permute;
	}
	
	function formSubmit(e) {
		e.preventDefault();
		
		var data = $(this).serializeArray().reduce(function(obj, item) {
			var name = item.name;
			obj[name] = item.value;
			return obj;
		}, {});

		var permutations = permuteConstructor(data);

		async.parallel(permutations.fns(), function(err, results) {

			var qs = results.reduce(function(str, email) {
				return str + '"' + email + '"' + '+OR+';
			}, '#q=').slice(0, -4);

			var win = window.open('https://google.com/' + qs, '_blank');
			win.focus();
		});
		
	}
	
	form.submit(formSubmit);

	$(document).foundation();
})();
