var CONFIG               = require("./config"),
    API_URL              = "https://api.teksavvy.com/web/Usage/UsageRecords?$skip=40",
    urllib               = require('urllib'),
    onPeakDownloadTotal  = 0,
    onPeakUploadTotal    = 0,
    offPeakDownloadTotal = 0,
    offPeakUploadTotal   = 0;

function downloadData (url) {
	urllib.request(url, {
		headers: {
			"TekSavvy-APIKey": CONFIG.API_KEY
		}
	}, function (err, rawData, res) {
		if (err) {
			throw err; // you need to handle error 
		}

		var functionStop  = false;

		JSON.parse(rawData.toString()).value.reverse().forEach (function (currentDataElement, index, array) {
			var year          = currentDataElement.Date.split("T")[0].split("-")[0],
			    month         = currentDataElement.Date.split("T")[0].split("-")[1],
			    day           = currentDataElement.Date.split("T")[0].split("-")[2],
			    previousMonth = index >= 1 ? array[ index - 1 ].Date.split("T")[0].split("-")[1] : null;

			if (index > 1 && month != previousMonth) {
				functionStop = true;
			}

			if (!functionStop) {
				onPeakDownloadTotal  += currentDataElement.OnPeakDownload,
				onPeakUploadTotal    += currentDataElement.OnPeakUpload,
				offPeakDownloadTotal += currentDataElement.OffPeakDownload,
				offPeakUploadTotal   += currentDataElement.OffPeakUpload;
			}
		});

		// data is Buffer instance
		console.log ("Data provided in GB and OnPeak/OffPeak\n  " +
			         "D: " + onPeakDownloadTotal.toFixed(2) + "/" + offPeakDownloadTotal.toFixed(2) + "\n  " +
			         "U: " + onPeakUploadTotal.toFixed(2)   + "/" + offPeakUploadTotal.toFixed(2));
	});
}

downloadData (API_URL);