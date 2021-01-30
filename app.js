const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const port = process.env.PORT || 8080;
const validUrl = require("valid-url");

var parseUrl = function (url) {
  url = decodeURIComponent(url);
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = "http://" + url;
  }

  return url;
};

app.get("/", function (req, res) {
  var urlToScreenshot = parseUrl(req.query.url);

  console.log(puppeteer.executablePath());

  if (validUrl.isWebUri(urlToScreenshot)) {
    console.log("Screenshotting: " + urlToScreenshot);
    (async () => {
      const browser = await puppeteer.launch({
        executablePath: "/usr/bin/chromium",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.goto(urlToScreenshot);
      await page.screenshot().then(function (buffer) {
        res.set({ "Content-Type": "image/png" });
        res.send(buffer);
      });

      await browser.close();
    })();
  } else {
    res.send("Invalid url: " + urlToScreenshot);
  }
});

app.listen(port, function () {
  console.log("App listening on port " + port);
});
