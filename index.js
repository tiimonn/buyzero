#!/usr/bin/env node
require('dotenv').config()
var http = require('http');
var https = require('https');
var path = require('path');
var chalk = require('chalk');
var request = require('request');
var cheerio = require('cheerio');
const axios = require('axios');

const timersPromises = require('timers/promises');
if (process.env.DELAY_IN_SECONDS === undefined) process.env.DELAY_IN_SECONDS = 60
if (process.env.URL === undefined) process.env.URL = "https://buyzero.de/products/raspberry-pi-4-model-b-8gb?variant=31817426698342"

if (process.env.TOKEN === undefined) {
	console.log('error', (Error('Cannot run without notify.events token')).message, (Error('Cannot run without notify.events token')).stack)
	process.exit(1)
}


let config = {
	headers: {
		'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582"
	}
}

const Message = require('@notify.events/nodejs').Message;
const { setTimeout } = require('timers/promises');

// Defining channel token.
// You get this token when creating a channel on the Notify.Events service.
const token = process.env.TOKEN;



// Attach the file to the message.
// message.addFile('path\to\local\file');




async function getHtmlData(url) {
	let res = await axios.get(url, config)
	return res;
}

async function processHtmlData(url) {
	let response = await getHtmlData(url);
	// Load html into cheerio
	var $ = cheerio.load(response.data);

	// Create Array of Auswahlmöglichkeiten
	const auswaehl = () => {
		var arr = new Array();
		$('span.product-form__selected-value').each(function () {
			arr.push($(this).text())
		})
		return arr;
	}

	// Create the data object of the product
	obj = {
		titel: $('span.breadcrumb__link').text().trim(),
		url: url,
		ausfuehrung: auswaehl(),
		preis: $('span.price').text().trim().match(/^\d+|\d+\b|\d+(?=\w)/g) + " €",
		lagerstatus: $('span.product-form__inventory').text().trim(),
		availability: $('span.product-meta__available-text').text().trim()
	};
	return obj;
}

async function printObjectData(url) {
	let object = await processHtmlData(url);

	// Define the current stock text color
	const lager = () => {
		if (object.lagerstatus === "Ausverkauft") return chalk.red(object.lagerstatus);
		if (object.lagerstatus === "Auf Lager") return chalk.green(object.lagerstatus);
		return chalk.dim.italic(object.lagerstatus);
	}

	// Print the whole data to the console
	console.log(chalk.blue.underline.bold("Titel: ") + "\n" + object.titel);
	console.log(chalk.blue.underline.bold("URL: ") + "\n" + chalk.dim.italic.gray(url));
	console.log(chalk.blue.underline.bold("Ausgewählte Ausführung: ") + "\n" + object.ausfuehrung.join("\n"));
	console.log(chalk.blue.underline.bold("Preis: ") + "\n" + object.preis);
	console.log(chalk.blue.underline.bold("Lagerstatus: ") + "\n" + lager());
	console.log(chalk.blue.underline.bold("Available Text: ") + "\n" + object.availability);
	console.log("\n");

	return object;
}

function getDateTime() {
	var currentdate = new Date();
	return currentdate.getFullYear() + "-"
		+ (currentdate.getMonth() + 1) + "-"
		+ currentdate.getDate() + " @ "
		+ currentdate.getHours() + ":"
		+ currentdate.getMinutes() + ":"
		+ currentdate.getSeconds();
}



(async () => {
	let available = false;
	console.log(chalk.green("Starting tracking of product..."));
	console.log("\n");

	while (available == false) {
		let res = await printObjectData(process.env.URL);

		const message = '✅ The Product: "' + res.titel + '" is available again ✅\n🧭 Last time checked was on ' + getDateTime() + '\n💻 Get it now at ' + res.url + '\n📊 ' + res.preis + '\n🚗 ' + res.availability + '\n📗 ' + res.ausfuehrung;

		const message2 = '✅ The Product: "' + res.titel + '" is available again ✅  🧭 Last time checked was on ' + getDateTime() + '🧭  💻 Get it now at ' + res.url + ' 💻  📊 ' + res.preis + '📊  🚗 ' + res.availability + '🚗  📗 ' + res.ausfuehrung.join(", ") + ' 📗';

		if (res.lagerstatus === "Auf Lager") available = true;
		if (available) {
			// Create a message object.
			if (process.env.TOKEN !== undefined) new Message(message2, res.titel + ' is available on ' + getDateTime(), Message.PRIORITY_HIGH, Message.LEVEL_INFO).send(token);
			console.log(message);
			console.log("\n");
		}
		else console.log(chalk.gray.bold.italic("unavailable on " + getDateTime() + "...\n"));
		await timersPromises.setTimeout(process.env.DELAY_IN_SECONDS * 1000);
	}

	console.log(
		chalk.red("Tracking stopped on " + chalk.gray.underline(getDateTime()) + chalk.red(" due to item being ")) + chalk.bold.green("available") + chalk.red(" again."));
	console.log("\n");
})();

