var CONFIG               = require("./config"),
    nodemailer           = require("nodemailer"),
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
		var functionStop = false,
		    subject      = "",
		    message      = "";
		    transporter  = nodemailer.createTransport({
		    	service: CONFIG.EMAIL_PROVIDER,
		    	auth: {
		    		user: CONFIG.EMAIL_USER,
		    		pass: CONFIG.EMAIL_PASSWORD
		    	}
		    });

		if (err) {
			throw err;
		}

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

		var dataOverage          = onPeakDownloadTotal - CONFIG.DATA_CAP,
		    percentUsedOfDataCap = Math.round ((onPeakDownloadTotal / CONFIG.DATA_CAP) * 100),
		    actualUsage          = (onPeakDownloadTotal + offPeakDownloadTotal + onPeakUploadTotal + offPeakUploadTotal);

		console.log ("     OnPeak/OffPeak (GB)\n  " +
		             "D: " + onPeakDownloadTotal.toFixed(2) + "/" + offPeakDownloadTotal.toFixed(2) + "\n  " +
		             "U: " + onPeakUploadTotal.toFixed(2)   + "/" + offPeakUploadTotal.toFixed(2));

		if (onPeakDownloadTotal > CONFIG.DATA_CAP) {
			subject = "!!! ALERT !!!",
			message = "Data limit exceded by " + dataOverage.toFixed(2) + "GB";
		} else if (onPeakDownloadTotal >= CONFIG.DATA_CAP * 0.80) {
			subject = "*** Warning ***",
			message = "You are at 80% of your data limit " + dataOverage.toFixed(2) + "GB";
		} else if (onPeakDownloadTotal >= CONFIG.DATA_CAP * 0.50) {
			subject = "Data usage notice",
			message = "You are at 50% of your data limit " + dataOverage.toFixed(2) + "GB";
		}
		
		console.log ("Used " + onPeakDownloadTotal + "GB* of " + CONFIG.DATA_CAP + "GB or " + percentUsedOfDataCap + "%");
		console.log ("");
		console.log ("* Billable usage, actual usage " + actualUsage.toFixed(2) + "GB" );

		var mailOptions = {
			from: "TekSavvy Data Watch <usage@data.teksavvy>",
			to: "stevenharradine@gmail.com",
			subject: subject,
			text: message,
			html: message
		};

		// if lowest threshold for sending mail
		if (onPeakDownloadTotal >= CONFIG.DATA_CAP * 0.50) {
			// send mail with defined transport object
			transporter.sendMail(mailOptions, function(error, info){
				if (error){
					console.log(error);
				} else {
					console.log("Message sent: " + info.response);
				}
			});
		}
	});
}

downloadData (API_URL);