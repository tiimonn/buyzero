#!/usr/bin/env node
var http = require('http');
var path = require('path');
var chalk = require('chalk');
var request = require('request');
var cheerio = require('cheerio');



function run(url) {
	// Define the options such as headers and the url
	const options = {
		url: url,
		headers: {
			'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582"
		}
	};

	request(options, function (err, res, html) {
		// Load html into cheerio
		var $ = cheerio.load(html);

		// Create Array of Auswahlmöglichkeiten
		const auswaehl = () => {
			var arr = new Array();
			$('span.product-form__selected-value').each(function () {
				arr.push($(this).text())
			})
			return arr;
		}

		// Create the data object of the product
		return obj = {
			titel: $('span.breadcrumb__link').text().trim(),
			url: url,
			ausfuehrung: auswaehl(),
			preis: $('span.price').text().trim().match(/^\d+|\d+\b|\d+(?=\w)/g) + " €",
			lagerstatus: $('span.product-form__inventory').text().trim(),
			availability: $('span.product-meta__available-text').text().trim()
		};
	});

	// Define the current stock text color
	const lager = () => {
		var text = obj.lagerstatus;
		if (text === "Ausverkauft") return chalk.red(text);
		if (text === "Auf Lager") return chalk.green(text);
		return chalk.dim.italic(text);
	}

	// Print the whole data to the console
	console.log(chalk.blue.underline.bold("Titel: ") + "\n" + obj.titel);
	console.log(chalk.blue.underline.bold("URL: ") + "\n" + chalk.dim.italic.gray(url));
	console.log(chalk.blue.underline.bold("Ausgewählte Ausführung: ") + "\n" + obj.ausfuehrung.join("\n"));
	console.log(chalk.blue.underline.bold("Preis: ") + "\n" + obj.preis);
	console.log(chalk.blue.underline.bold("Lagerstatus: ") + "\n" + lager());
	console.log(chalk.blue.underline.bold("Available Text: ") + "\n" + obj.availability);
	console.log("\n");

}



// Lagerstatus
// $('span[class="product-form__inventory inventory"]')
// Titel
// $('span[class="breadcrumb__link"]')
// Available Text
// $('span[class="product-meta__available-text"]')
// Auswählbare Ausführungen
// $('span[class="product-form__selected-value"]')
// Preis
// $('span[class="price"]')



const track = theurl => {
	// First run
	run(theurl).then((message) => console.log(message));

}



console.log("\n");
track('https://buyzero.de/products/raspberry-pi-4-model-b-8gb')
// run('https://buyzero.de/products/raspberry-pi-4-model-b-8gb?variant=40326644564148')
// run('https://buyzero.de/products/raspberry-pi-4b?variant=40326653542580')
// run('https://buyzero.de/products/flirc-gehause-fur-raspberry-pi-4')