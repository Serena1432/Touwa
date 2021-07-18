/*
	Touwa - An unofficial API for HentaiVN.tv
	version 1.0.0
	Made by Nico Levianth/Meir/LilShieru in 2021.
	Copyright (C) 2016-2021 HentaiVN.tv. All rights reserved.
*/

/*
-----------------------------------------------------------------
	Modules importing
-----------------------------------------------------------------
*/
const express = require('express')
const app = express();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require("request");

/*
-----------------------------------------------------------------
	Configuration
-----------------------------------------------------------------
*/
var version = "1", domain = "https://hentaivn.tv";

/*
-----------------------------------------------------------------
	Main page
-----------------------------------------------------------------
*/
app.get("/", function(req, res) {
	// Add some headers
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Content-Type", "application/json");
	// Declaring the time and URL variable
	var time = new Date(), url = domain;
	// Getting content from the website
	request(url, function(error, response, body) {
		// Returning error if have
		if (error) return res.status(500).send({success: false, error_code: 500, message: error.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		if (response.statusCode != 200) return res.status(503).send({success: false, error_code: 503, message: "The target website returned a " + response.statusCode + " error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		// Declaring the ping variable
		var ping = new Date().getTime() - time.getTime();
		// Returning the normal status
		return res.send({success: true, url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki", ping: ping + "ms"});
	});
});

/*
-----------------------------------------------------------------
	Getting latest comic list
-----------------------------------------------------------------
*/
app.get("/comic/latest", function(req, res) {
	// Add some headers
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Content-Type", "application/json");
	// Declaring the time and URL variable
	var time = new Date(), url = domain;
	// Getting content from the website
	request(url, function(error, response, body) {
		// Returning error if have
		if (error) return res.status(500).send({success: false, error_code: 500, message: error.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		if (response.statusCode != 200) return res.status(503).send({success: false, error_code: 503, message: "The target website returned a " + response.statusCode + " error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		// Declaring the ping variable
		var ping = new Date().getTime() - time.getTime();
		// Parsing content
		var data = [];
		const dom = new JSDOM(body), document = dom.window.document;
		try {
			var comic_list = document.getElementsByClassName("page-item")[0].getElementsByTagName("li");
			for (var i = 0; i < comic_list.length; i++) {
				var comic = comic_list[i], background = comic.getElementsByTagName("a")[0].getElementsByTagName("div")[0].style.background;
				var link = comic.getElementsByTagName("a")[0].href, name = link.substr(link.indexOf("/") + 1);
				data.push({
					url: domain + link,
					name: comic.getElementsByTagName("h2")[0].textContent,
					image_url: background.substr(background.indexOf("https://"), background.lastIndexOf(")") - background.indexOf("https://")),
					code: name.substr(0, name.indexOf(".html"))
				});
			}
		}
		catch (err) {
			console.error(err);
			return res.status(500).send({success: false, error_code: 500, message: err.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		}
		// Returning the normal status
		return res.send({success: true, url: url, ping: ping + "ms", data: data});
	});
});

/*
-----------------------------------------------------------------
	Getting a specific comic
-----------------------------------------------------------------
*/
app.get("/comic/:id", function(req, res) {
	// Add some headers
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Content-Type", "application/json");
	// Declaring the time and URL variable
	var time = new Date(), url = domain + "/" + req.params.id + "-doc-truyen-.html";
	// Getting content from the website
	request(url, function(error, response, body) {
		// Returning error if have
		if (error) return res.status(500).send({success: false, error_code: 500, message: error.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		if (response.statusCode != 200) return res.status(503).send({success: false, error_code: 503, message: "The target website returned a " + response.statusCode + " error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		// Declaring the ping variable
		var ping = new Date().getTime() - time.getTime();
		// Parsing content
		const dom = new JSDOM(body), document = dom.window.document;
		try {
			if (document.title.includes("404")) return res.status(404).send({success: false, error_code: 404, message: "The target website returned a 404 error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
			var title = document.getElementsByClassName("page-info")[0].getElementsByTagName("h1")[0].textContent, data = {
				name: title.substr(2, title.lastIndexOf(" - ") - 2),
				image_url: document.getElementsByClassName("page-ava")[0].getElementsByTagName("img")[0].src
			}, info = document.getElementsByClassName("page-info")[0].getElementsByTagName("p"), description = [];
			data.uploader = {
				name: document.getElementsByClassName("name-uploader")[0].getElementsByTagName("b")[0].textContent,
				link: domain + document.getElementsByClassName("name-uploader")[0].getElementsByTagName("a")[0].href,
				badge: document.getElementsByClassName("name-uploader")[0].getElementsByTagName("strong")[0].textContent.substr(1)
			};
			for (var i = 0; i < info.length; i++) {
				if (info[i].getElementsByClassName("info").length > 0) switch (info[i].getElementsByClassName("info")[0].textContent) {
					case "Tên Khác: ": {
						data.other_names = [];
						for (var j = 1; j < info[i].getElementsByTagName("span").length; j++) data.other_names.push({
							name: info[i].getElementsByTagName("span")[j].getElementsByTagName("a")[0].textContent,
							link: domain + info[i].getElementsByTagName("span")[j].getElementsByTagName("a")[0].href
						});
						break;
					}
					case "Thể Loại:": {
						data.tags = [];
						for (var j = 1; j < info[i].getElementsByTagName("span").length; j++) {
							var tagLink = info[i].getElementsByTagName("span")[j].getElementsByTagName("a")[0].href, name = tagLink.substr(tagLink.indexOf("the-loai-") + 9);
							data.tags.push({
								name: info[i].getElementsByTagName("span")[j].textContent,
								link: domain + info[i].getElementsByTagName("span")[j].getElementsByTagName("a")[0].href,
								tag: name.substr(0, name.indexOf(".html"))
							});
						}
						break;
					}
					case "Nhóm dịch:": {
						data.group = {
							name: info[i].getElementsByTagName("span")[1].textContent,
							link: domain + info[i].getElementsByTagName("span")[1].getElementsByTagName("a")[0].href
						};
						break;
					}
					case "Tác giả: ": {
						data.authors = [];
						for (var j = 1; j < info[i].getElementsByTagName("span").length; j++) data.authors.push({
							name: info[i].getElementsByTagName("span")[j].getElementsByTagName("a")[0].textContent,
							link: domain + info[i].getElementsByTagName("span")[j].getElementsByTagName("a")[0].href
						});
						break;
					}
					case "Nhân vật: ": {
						data.characters = [];
						for (var j = 1; j < info[i].getElementsByTagName("span").length; j++) data.characters.push({
							name: info[i].getElementsByTagName("span")[j].getElementsByTagName("a")[0].textContent,
							link: domain + info[i].getElementsByTagName("span")[j].getElementsByTagName("a")[0].href
						});
						break;
					}
					case "Doujinshi: ": {
						data.doujins = [];
						for (var j = 1; j < info[i].getElementsByTagName("span").length; j++) data.doujins.push({
							name: info[i].getElementsByTagName("span")[j].getElementsByTagName("a")[0].textContent,
							link: domain + info[i].getElementsByTagName("span")[j].getElementsByTagName("a")[0].href
						});
						break;
					}
					case "Tình Trạng: ": {
						switch (info[i].getElementsByTagName("span")[1].textContent) {
							case "Đã hoàn thành": {
								data.completed = true;
								break;
							}
							case "Đang tiến hành": {
								data.completed = false;
								break;
							}
						}
						var views = info[i].textContent;
						data.views = parseInt(views.substr(views.indexOf("Lượt xem: ") + 10, views.lastIndexOf("          \n\n\n\n") - views.indexOf("Lượt xem: ") - 10).replace(".", "").replace(".", ""))
						break;
					}
					case "Thực hiện:": {
						data.credits = info[i].textContent.substr(11);
						break;
					}
					case "Phần khác:": {
						data.other_parts = [];
						for (var j = 1; j < info[i].getElementsByTagName("span").length; j++) data.other_parts.push({
							name: info[i].getElementsByTagName("span")[j].getElementsByTagName("a")[0].textContent,
							link: domain + info[i].getElementsByTagName("span")[j].getElementsByTagName("a")[0].href
						});
						break;
					}
					case "Phó thớt: ": {
						data.co_uploader = {
							name: info[i].getElementsByTagName("a")[0].getElementsByTagName("b")[0].textContent,
							link: domain + info[i].getElementsByTagName("a")[0].href
						};
						break;
					}
					case "Ủng hộ nhóm tại:": {
						data.group_external_link = info[i].getElementsByTagName("a")[0].href;
						break;
					}
					case "Download:": {
						data.download_link = domain + info[i].getElementsByTagName("a")[0].href
						break;
					}
				}
				else description.push(info[i].textContent);
			}
			data.description = description.join("\n");
			data.likes = parseInt(document.getElementsByClassName("but_like")[0].textContent.substr(1));
			data.dislikes = parseInt(document.getElementsByClassName("but_unlike")[0].textContent.substr(1));
			data.chapters = [];
			var chaps = document.getElementsByClassName("listing")[0].getElementsByTagName("tr");
			for (var i = 0; i < chaps.length; i++) {
				var chap = chaps[i];
				var chapLink = chap.getElementsByTagName("a")[0].href, name = chapLink.substr(chapLink.indexOf("/") + 1);
				data.chapters.push({
					name: chap.getElementsByTagName("h2")[0].textContent,
					link: domain + chap.getElementsByTagName("a")[0].href,
					upload_date: chap.getElementsByTagName("td")[1].textContent,
					code: name.substr(0, name.indexOf(".html"))
				});
			}
		}
		catch (err) {
			console.error(err);
			return res.status(500).send({success: false, error_code: 500, message: err.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		}
		// Returning the normal status
		return res.send({success: true, url: url, ping: ping + "ms", data: data});
	});
});

/*
-----------------------------------------------------------------
	Getting a specific comic's chapters
-----------------------------------------------------------------
*/
app.get("/comic/:id/chapters", function(req, res) {
	// Add some headers
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Content-Type", "application/json");
	// Declaring the time and URL variable
	var time = new Date(), url = domain + "/" + req.params.id + "-doc-truyen-.html";
	// Getting content from the website
	request(url, function(error, response, body) {
		// Returning error if have
		if (error) return res.status(500).send({success: false, error_code: 500, message: error.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		if (response.statusCode != 200) return res.status(503).send({success: false, error_code: 503, message: "The target website returned a " + response.statusCode + " error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		// Declaring the ping variable
		var ping = new Date().getTime() - time.getTime();
		// Parsing content
		const dom = new JSDOM(body), document = dom.window.document;
		try {
			if (document.title.includes("404")) return res.status(404).send({success: false, error_code: 404, message: "The target website returned a 404 error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
			var data = [];
			var chaps = document.getElementsByClassName("listing")[0].getElementsByTagName("tr");
			for (var i = 0; i < chaps.length; i++) {
				var chap = chaps[i];
				var chapLink = chap.getElementsByTagName("a")[0].href, name = chapLink.substr(chapLink.indexOf("/") + 1);
				data.push({
					name: chap.getElementsByTagName("h2")[0].textContent,
					link: domain + chap.getElementsByTagName("a")[0].href,
					upload_date: chap.getElementsByTagName("td")[1].textContent,
					code: name.substr(0, name.indexOf(".html"))
				});
			}
		}
		catch (err) {
			console.error(err);
			return res.status(500).send({success: false, error_code: 500, message: err.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		}
		// Returning the normal status
		return res.send({success: true, url: url, ping: ping + "ms", data: data});
	});
});

/*
-----------------------------------------------------------------
	Getting images of a chapter
-----------------------------------------------------------------
*/
app.get("/read/:code", function(req, res) {
	// Add some headers
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Content-Type", "application/json");
	// Declaring the time and URL variable
	var time = new Date(), url = domain + "/" + req.params.code + ".html";
	// Getting content from the website
	request(url, function(error, response, body) {
		// Returning error if have
		if (error) return res.status(500).send({success: false, error_code: 500, message: error.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		if (response.statusCode != 200) return res.status(503).send({success: false, error_code: 503, message: "The target website returned a " + response.statusCode + " error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		// Declaring the ping variable
		var ping = new Date().getTime() - time.getTime();
		// Parsing content
		const dom = new JSDOM(body), document = dom.window.document;
		try {
			if (document.title.includes("404")) return res.status(404).send({success: false, error_code: 404, message: "The target website returned a 404 error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
			var data = {
				comic: {
					name: document.getElementsByClassName("bar-title-episode")[0].getElementsByTagName("a")[0].textContent,
					link: domain + document.getElementsByClassName("bar-title-episode")[0].getElementsByTagName("a")[0].href,
					id: parseInt(document.getElementsByClassName("bar-title-episode")[0].getElementsByTagName("a")[0].href.substr(1, document.getElementsByClassName("bar-title-episode")[0].getElementsByTagName("a")[0].href.indexOf("-")))
				},
				chapter_name: document.getElementById("unzoom").getElementsByTagName("li")[3].getElementsByTagName("a")[0].textContent.replace("\n", ""),
				images: []
			};
			var imgs = document.getElementById("image").getElementsByTagName("img");
			for (var i = 0; i < imgs.length; i++) {
				data.images.push(imgs[i].src);
			}
		}
		catch (err) {
			console.error(err);
			return res.status(500).send({success: false, error_code: 500, message: err.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		}
		// Returning the normal status
		return res.send({success: true, url: url, ping: ping + "ms", data: data});
	});
});

/*
-----------------------------------------------------------------
	Getting information of an author
-----------------------------------------------------------------
*/
app.get("/author/:name", function(req, res) {
	// Add some headers
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Content-Type", "application/json");
	// Declaring the time and URL variable
	var time = new Date(), url = domain + "/tacgia=" + encodeURIComponent(req.params.name) + ".html?page=" + (req.query.page || 1);
	// Getting content from the website
	request(url, function(error, response, body) {
		// Returning error if have
		if (error) return res.status(500).send({success: false, error_code: 500, message: error.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		if (response.statusCode != 200) return res.status(503).send({success: false, error_code: 503, message: "The target website returned a " + response.statusCode + " error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		// Declaring the ping variable
		var ping = new Date().getTime() - time.getTime();
		// Parsing content
		const dom = new JSDOM(body), document = dom.window.document;
		try {
			if (document.title.includes("404")) return res.status(404).send({success: false, error_code: 404, message: "The target website returned a 404 error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
			if (document.getElementsByClassName("block-item")[0].getElementsByTagName("li")[0].textContent == "Not found") return res.status(404).send({success: false, error_code: 404, message: "The target website returned a 404 error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
			var data = [], comics = document.getElementsByClassName("item");
			for (var i = 0; i < comics.length; i++) {
				var comic = document.getElementsByClassName("item")[i];
				var info = comic.getElementsByTagName("p");
				var other_names = [], tags = [], views;
				for (var j = 1; j < info.length; j++) {
					switch (info[j].getElementsByClassName("info")[0].textContent) {
						case "Tên Khác: ": {
							for (var k = 0; k < info[j].getElementsByTagName("span").length; k++) other_names.push({
								name: info[j].getElementsByTagName("span")[k].getElementsByTagName("a")[0].textContent,
								link: domain + info[j].getElementsByTagName("span")[k].getElementsByTagName("a")[0].href
							});
							break;
						}
						case "Thể Loại: ": {
							tags = [];
							for (var k = 0; k < info[j].getElementsByTagName("span").length; k++) {
								var tagLink = info[j].getElementsByTagName("span")[k].getElementsByTagName("a")[0].href, name = tagLink.substr(tagLink.indexOf("the-loai-") + 9);
								tags.push({
									name: info[j].getElementsByTagName("span")[k].textContent,
									link: domain + info[j].getElementsByTagName("span")[k].getElementsByTagName("a")[0].href,
									tag: name.substr(0, name.indexOf(".html"))
								});
							}
							break;
						}
						case "Lượt xem: ": {
							views = parseInt(info[j].textContent.substr(11).replace(".", "").replace(".", ""))
							break;
						}
					}
				}
				data.push({
					name: comic.getElementsByClassName("box-description")[0].getElementsByTagName("a")[0].textContent,
					link: domain + comic.getElementsByClassName("box-description")[0].getElementsByTagName("a")[0].href,
					chapter_status: comic.getElementsByClassName("box-description")[0].getElementsByTagName("p")[0].textContent.substr(comic.getElementsByClassName("box-description")[0].getElementsByTagName("a")[0].textContent.length + 4),
					tags: tags,
					other_names: other_names,
					views: views
				});
			}
		}
		catch (err) {
			console.error(err);
			return res.status(500).send({success: false, error_code: 500, message: err.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		}
		// Returning the normal status
		return res.send({success: true, url: url, ping: ping + "ms", data: data});
	});


/*
-----------------------------------------------------------------
	Getting information of a doujinshi
-----------------------------------------------------------------
*/
app.get("/doujin/:name", function(req, res) {
	// Add some headers
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Content-Type", "application/json");
	// Declaring the time and URL variable
	var time = new Date(), url = domain + "/tim-kiem-doujinshi.html?key=" + encodeURIComponent(req.params.name) + "&page=" + (req.query.page || 1);
	// Getting content from the website
	request(url, function(error, response, body) {
		// Returning error if have
		if (error) return res.status(500).send({success: false, error_code: 500, message: error.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		if (response.statusCode != 200) return res.status(503).send({success: false, error_code: 503, message: "The target website returned a " + response.statusCode + " error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		// Declaring the ping variable
		var ping = new Date().getTime() - time.getTime();
		// Parsing content
		const dom = new JSDOM(body), document = dom.window.document;
		try {
			if (document.title.includes("404")) return res.status(404).send({success: false, error_code: 404, message: "The target website returned a 404 error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
			if (document.getElementsByClassName("block-item")[0].getElementsByTagName("li")[0].textContent == "Not found") return res.status(404).send({success: false, error_code: 404, message: "The target website returned a 404 error.", url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
			var data = [], comics = document.getElementsByClassName("item");
			for (var i = 0; i < comics.length; i++) {
				var comic = document.getElementsByClassName("item")[i];
				var info = comic.getElementsByTagName("p");
				var other_names = [], tags = [], views;
				for (var j = 1; j < info.length; j++) {
					switch (info[j].getElementsByClassName("info")[0].textContent) {
						case "Tên Khác: ": {
							for (var k = 0; k < info[j].getElementsByTagName("span").length; k++) other_names.push({
								name: info[j].getElementsByTagName("span")[k].getElementsByTagName("a")[0].textContent,
								link: domain + info[j].getElementsByTagName("span")[k].getElementsByTagName("a")[0].href
							});
							break;
						}
						case "Thể Loại: ": {
							tags = [];
							for (var k = 0; k < info[j].getElementsByTagName("span").length; k++) {
								var tagLink = info[j].getElementsByTagName("span")[k].getElementsByTagName("a")[0].href, name = tagLink.substr(tagLink.indexOf("the-loai-") + 9);
								tags.push({
									name: info[j].getElementsByTagName("span")[k].textContent,
									link: domain + info[j].getElementsByTagName("span")[k].getElementsByTagName("a")[0].href,
									tag: name.substr(0, name.indexOf(".html"))
								});
							}
							break;
						}
						case "Lượt xem: ": {
							views = parseInt(info[j].textContent.substr(11).replace(".", "").replace(".", ""))
							break;
						}
					}
				}
				data.push({
					name: comic.getElementsByClassName("box-description")[0].getElementsByTagName("a")[0].textContent,
					link: domain + comic.getElementsByClassName("box-description")[0].getElementsByTagName("a")[0].href,
					chapter_status: comic.getElementsByClassName("box-description")[0].getElementsByTagName("p")[0].textContent.substr(comic.getElementsByClassName("box-description")[0].getElementsByTagName("a")[0].textContent.length + 4),
					tags: tags,
					other_names: other_names,
					views: views
				});
			}
		}
		catch (err) {
			console.error(err);
			return res.status(500).send({success: false, error_code: 500, message: err.toString(), url: url, documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
		}
		// Returning the normal status
		return res.send({success: true, url: url, ping: ping + "ms", data: data});
	});
});

/*
-----------------------------------------------------------------
	Error handling
-----------------------------------------------------------------
*/
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Content-Type", "application/json");
	res.status(404).send({success: false, error_code: 404, message: "Invalid endpoint.", url: "", documentation_url: "https://www.github.com/LilShieru/Touwa/wiki"});
});


/*
-----------------------------------------------------------------
	Open the API port
-----------------------------------------------------------------
*/
app.listen(process.env.PORT || 3000, function () {
  console.log('Touwa API has been started successfully!');
});
