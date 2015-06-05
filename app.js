var API_URL = "https://api.teksavvy.com/web/Usage/UsageRecords",
    urllib = require('urllib');

urllib.request(API_URL, {
	headers: {
		"TekSavvy-APIKey": "<< YOURKEY >>"
	}
}, function (err, data, res) {
	if (err) {
		throw err; // you need to handle error 
	}

	var data = JSON.parse(data.toString()).value;

	data.forEach (function (currentDataElement) {
		console.log (currentDataElement.Date);
	});

	// data is Buffer instance
	console.log ();
});