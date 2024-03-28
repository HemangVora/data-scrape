import * as dotenv from "dotenv";
dotenv.config();
import cloudscraper from "cloudscraper";
import express from "express";
import mongoose from "mongoose";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import cloudflareScraper from "cloudflare-scraper";

puppeteer.use(StealthPlugin());
import { exec } from "child_process";
import { executablePath } from "puppeteer";
const curlCommand = `curl 'https://core-api.prod.blur.io/v1/blend/active-liens/0xbd3531da5cf5857e7cfaa92426877b022e612cf8' \
  -H 'accept: */*' \
  -H 'accept-language: en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7' \
  -H 'cookie: rl_page_init_referrer=RudderEncrypt%3AU2FsdGVkX1%2FlSN88%2BDLogGHmJLm4uIIkjBymBKbcc9vGzFUcfGam3yaWO0b3HYyM; rl_page_init_referring_domain=RudderEncrypt%3AU2FsdGVkX1%2BgVViISIN3neKvaNS5pn11uMdCiHRNwpg%3D; _ga=GA1.1.482897642.1710265645; _ga_C09NSBBFNH=GS1.1.1710265645.1.1.1710265779.0.0.0; fs_uid=#o-19FFTT-na1#9fa28098-c277-451d-a0d8-b9cbef6ee45b:deeeafd5-a9d4-4907-b240-1f5f3d654712:1710265719842::2#/1734245244; rl_user_id=RudderEncrypt%3AU2FsdGVkX1%2BuoWBJDt4XB%2FOoENgALHjSEIHsBd%2FgOa0%3D; rl_trait=RudderEncrypt%3AU2FsdGVkX18RtIGzjkDgaT1iwecxic5kJY%2Fb%2F6Gx1Ps%3D; rl_group_id=RudderEncrypt%3AU2FsdGVkX1%2BTMiz3jxSekoCyqp%2FebhAmowPkAnZLjoo%3D; rl_group_trait=RudderEncrypt%3AU2FsdGVkX19i76kQbQ%2BJgF9ltowBDY5UQEm05miulq4%3D; rl_anonymous_id=RudderEncrypt%3AU2FsdGVkX1%2FTE0tWFotSvmVbglD7ewtHJn99KEdXeqNFsEfZj%2FclIaHLMoFolC9%2BCGwDSosyZbyI8DfEvemEbw%3D%3D; __cf_bm=ft7IonynvOMBqRGma_I.tNauFchKjwWWs70gMw4Q6ow-1711654727-1.0.1.1-5TbJNwObxjDXNW86tT7UeC1GzZQgPOZf6NbSPmZ0dNVwBNHbu1.lwP4zJNowMEjid3gDVLhl2tMgZIRujH2oKw; rl_session=RudderEncrypt%3AU2FsdGVkX19gQVStvYBYRh3amta3fTt4%2BzGhrT%2F9l2St8ho5WxnmZd1JOEfdRhg5T0Q5jtcShkFODl52biztfOswApm8pwMF0RfLm%2FkXxTS112tVALTSXcPuP4A62sAH38HUQBY1nrfX4uuphsFeGw%3D%3D' \
  -H 'if-none-match: W/"5ceaa-b4zxUrwO3qLJ8zoJoxw0zc5GNpg"' \
  -H 'origin: https://blur.io' \
  -H 'referer: https://blur.io/' \
  -H 'sec-ch-ua: "Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-site' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'`;

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    fetchDataAndSave();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

const ApiResponseSchema = new mongoose.Schema({
  data: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const ApiResponse = mongoose.model("ApiResponse", ApiResponseSchema);

const options = {
  headers: {
    Accept: "*/*",

    "accept-Encoding": "gzip, deflate, br, zstd",
    "content-type": "text/plain",
    "accept-language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    cookie:
      "rl_page_init_referrer=RudderEncrypt%3AU2FsdGVkX1%2FlSN88%2BDLogGHmJLm4uIIkjBymBKbcc9vGzFUcfGam3yaWO0b3HYyM; rl_page_init_referring_domain=RudderEncrypt%3AU2FsdGVkX1%2BgVViISIN3neKvaNS5pn11uMdCiHRNwpg%3D; _ga=GA1.1.482897642.1710265645; _ga_C09NSBBFNH=GS1.1.1710265645.1.1.1710265779.0.0.0; fs_uid=#o-19FFTT-na1#9fa28098-c277-451d-a0d8-b9cbef6ee45b:deeeafd5-a9d4-4907-b240-1f5f3d654712:1710265719842::2#/1734245244; rl_user_id=RudderEncrypt%3AU2FsdGVkX187euB47QC1lMLMzo5X0%2By8QiIUY8CK%2B18%3D; rl_trait=RudderEncrypt%3AU2FsdGVkX18fEHrHZfnkoFxFeVOmxlHnZlzBCT%2FQjs4%3D; rl_group_id=RudderEncrypt%3AU2FsdGVkX19UkqmVtTWkIUB17pIwcT0DnbRKUWX%2FEQk%3D; rl_group_trait=RudderEncrypt%3AU2FsdGVkX1%2BbsUn2Sy7fU6WSgmMtE5XyWwySKTyNTrU%3D; rl_anonymous_id=RudderEncrypt%3AU2FsdGVkX19VsAtYGF7g6CUoUuWY0kgXWsgrqzNbHcKUad37E0zGpkmZdZyS63mZIKBNSElgmAM8MLd2qSljPg%3D%3D; __cf_bm=YOU9LUwlvn55iGk5zvZHYkfK_2OgXcfyPmVk_yrBWg8-1711615149-1.0.1.1-csqflB9bk_BfaTaOWG545xHgwlurkGVzWxIpodjX.QjcVQLpPrE.eEtPrNMGi6mE99J9jUvJjFxs5nLnp2SKMw; rl_session=RudderEncrypt%3AU2FsdGVkX19uq0qjdt5WZBdoHDBPuvgmOgxEQuxZcuIeXukd%2FQN4M56aJ6Eack7oxMGT3T2FH%2BmnSmiKaH%2FeV8IM5mxWDcB0zVtt%2FXF938Z0bAe4CiPajuutOPpLHetspfTCuMHIiRe%2Fe27jb0mQfA%3D%3D",
    "if-none-match": 'W/"5c028-o4ZnxrSRIjtRGGcDnFI7naMthK8"',
    origin: "https://blur.io/",
    referer: "https://blur.io/",
    "sec-ch-ua":
      '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  },
  cloudflareTimeout: 5000,
  // Reduce Cloudflare's timeout to cloudflareMaxTimeout if it is excessive
  cloudflareMaxTimeout: 30000,
  // followAllRedirects - follow non-GET HTTP 3xx responses as redirects
  followAllRedirects: true,
  // Support only this max challenges in row. If CF returns more, throw an error
  challengesToSolve: 3,
  // Remove Cloudflare's email protection, replace encoded email with decoded versions
  decodeEmails: false,
  // Support gzip encoded responses (Should be enabled unless using custom headers)
  gzip: true,

  // uri: "https://104.18.10.49:443/v1/blend/active-liens/0xbd3531da5cf5857e7cfaa92426877b022e612cf8",
  url: "https://core-api.prod.blur.io/v1/blend/active-liens/0xbd3531da5cf5857e7cfaa92426877b022e612cf8",
  method: "GET",
  timeout: {
    send: 5000,
  },
};

async function fetchDataAndSave() {
  try {
    // exec(curlCommand, async (error, stdout, stderr) => {
    //   if (error) {
    //     console.error(`exec error: ${error}`);
    //     return;
    //   }
    //   if (stderr) {
    //     console.log(`Response: ${stdout}`);
    //     let apiresp = JSON.parse(stdout);
    //     const apiResponse = new ApiResponse({ data: apiresp });
    //     await apiResponse.save();
    //     console.log("Data saved to MongoDB");
    //     return;
    //   }
    //   // Output the response from your curl command
    //   console.log(`Response: ${stdout}`);
    // });
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    try {
      const page = await browser.newPage();

      console.log("we are reasy to rock and roll");

      await page.setViewport({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 3000 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
      });
      await page.goto(
        "https://core-api.prod.blur.io/v1/blend/active-liens/0xbd3531da5cf5857e7cfaa92426877b022e612cf8"
      );
      console.log("this 1");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("this");
      // Extracting JSON data directly
      const jsonContent = await page.evaluate(() => document.body.innerText);

      // Optionally, parse the JSON to ensure it's valid and perhaps to manipulate it before saving
      console.log(jsonContent);
      const jsonData = JSON.parse(jsonContent);
      console.log(jsonData);
      console.log("JSON data has been saved.");
    } catch (e) {
      console.error(e);
      res.send(`Something went wrong while running Puppeteer: ${e}`);
    } finally {
      await browser.close();
    }
    // cloudscraper(options)
    //   .then(async function (data) {
    //     const apiResponse = new ApiResponse({ data: data });
    //     await apiResponse.save();
    //     console.log("Data saved to MongoDB");
    //   })
    //   .catch(function (err) {
    //     console.log(err);
    //   });
  } catch (error) {
    console.error("Error:", error);
  }
}

app.get("/get", async (req, res) => {
  const apiResponse = await ApiResponse.find({});
  // console.log(apiResponse);
  return res.json({ apiResponse });
});
// Call fetchDataAndSave every 5 minutes
setInterval(fetchDataAndSave, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
