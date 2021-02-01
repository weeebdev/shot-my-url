const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const port = process.env.PORT || 8080;
const validUrl = require("valid-url");
const path = require("path");

var parseUrl = function (url) {
  url = decodeURIComponent(url);
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = "http://" + url;
  }

  return url;
};

app.get("/", function (req, res) {
  const { url, device, timeout, width, height } = req.query;

  var urlToScreenshot = parseUrl(url);

  if (validUrl.isWebUri(urlToScreenshot)) {
    (async () => {
      const browser = await puppeteer.launch({
        executablePath: process.env.ON_HEROKU ? null : "/usr/bin/chromium",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: {
          width: parseInt(width) ? parseInt(width) : 800,
          height: parseInt(height) ? parseInt(height) : 600,
        },
      });

      res.set({ "Content-Type": "image/png" });

      try {
        const page = await browser.newPage();

        if (Number.parseInt(timeout))
          page.setDefaultNavigationTimeout(Number.parseInt(timeout));

        if (puppeteer.devices[device])
          await page.emulate(puppeteer.devices[device]);

        await page.goto(urlToScreenshot);
        await page.screenshot().then(function (buffer) {
          res.send(buffer);
        });
      } catch (err) {
        console.error(err);
        res.sendFile("qEfv0Iok.jpg", { root: path.join(__dirname, "/img") });
      }

      await browser.close();
    })();
  } else {
    res.send("Invalid url: " + urlToScreenshot);
  }
});

app.listen(port, function () {
  console.log("App listening on port " + port);
});
