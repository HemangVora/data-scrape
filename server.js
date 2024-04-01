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
import axios from "axios";
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
    // fetchDataAndSave();
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
const ApiResponseZenrows = mongoose.model(
  "ApiResponseZenrows",
  ApiResponseSchema
);
const ApiResponseScrapingAnt = mongoose.model(
  "ApiResponseScrapingAnt",
  ApiResponseSchema
);
const ApiMetrixSchema = new mongoose.Schema({
  success_req_count: mongoose.Schema.Types.String,
  name: mongoose.Schema.Types.String,
  total_req_count: mongoose.Schema.Types.String,
  status_code_arr: mongoose.Schema.Types.Array,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const ApiMetrix = mongoose.model("ApiMetrix", ApiMetrixSchema);

async function fetchDataAndSave() {
  console.log("starting to execute zenrows");
  const url =
    "https://core-api.prod.blur.io/v1/blend/active-liens/0xbd3531da5cf5857e7cfaa92426877b022e612cf8";
  const apikey = "c77bc7ac5fa9dd3d8bb63e1f9b304c2e66f72940";
  axios({
    url: "https://api.zenrows.com/v1/",
    method: "GET",
    params: {
      url: url,
      apikey: apikey,
      autoparse: "true",
    },
  })
    .then(async (response) => {
      console.log(response.status);
      const apiResponse = new ApiResponseZenrows({ data: response.data });
      await apiResponse.save();

      let zenrow = await ApiMetrix.findOne({ name: "zenrows" });
      if (!zenrow) {
        const ApiMetrixresp = new ApiMetrix({
          name: "zenrows",
          success_req_count: "1",
          total_req_count: "1",
          status_code_arr: [{ code: response.status, id: "1" }],
        });
        await ApiMetrixresp.save();
      } else {
        zenrow.total_req_count = parseInt(zenrow.total_req_count) + 1;
        zenrow.success_req_count = parseInt(zenrow.success_req_count) + 1;
        zenrow.status_code_arr.push({
          code: response.status,
          id: zenrow.total_req_count,
        });
        await zenrow.save();
      }
      console.log("zenrows executed successfully");
    })
    .catch(async (error) => {
      console.log(error);
      let zenrow = await ApiMetrix.findOne({ name: "zenrows" });
      zenrow.total_req_count = parseInt(zenrow.total_req_count) + 1 + "";
      await zenrow.save();
    });

  console.log("starting to execute ScrapingAnt");
  const options = {
    method: "GET",
    url: "https://scrapingant.p.rapidapi.com/get",
    params: {
      url: "https://core-api.prod.blur.io/v1/blend/active-liens/0xbd3531da5cf5857e7cfaa92426877b022e612cf8",
    },
    headers: {
      "X-RapidAPI-Key": "d627baa430msh0cea6b635744b8fp122576jsnfee27dd06dda",
      "X-RapidAPI-Host": "scrapingant.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const apiResponse1 = new ApiResponseScrapingAnt({ data: response.data });
    await apiResponse1.save();

    let ScrapingAnt = await ApiMetrix.findOne({ name: "ScrapingAnt" });
    if (!ScrapingAnt) {
      const ApiMetrixresp = new ApiMetrix({
        name: "ScrapingAnt",
        success_req_count: "1",
        total_req_count: "1",
        status_code_arr: [{ code: response.status, id: "1" }],
      });
      await ApiMetrixresp.save();
    } else {
      ScrapingAnt.total_req_count = parseInt(ScrapingAnt.total_req_count) + 1;
      ScrapingAnt.success_req_count =
        parseInt(ScrapingAnt.success_req_count) + 1;
      ScrapingAnt.status_code_arr.push({
        code: response.status,
        id: ScrapingAnt.total_req_count,
      });
      await ScrapingAnt.save();
    }
  } catch (error) {
    console.error(error);
    let ScrapingAnt = await ApiMetrix.findOne({ name: "ScrapingAnt" });
    ScrapingAnt.total_req_count =
      parseInt(ScrapingAnt.total_req_count) + 1 + "";
    await ScrapingAnt.save();
  }
  console.log("ScrapingAnt executed successfully");
}

app.get("/get", async (req, res) => {
  const apiResponse = await ApiResponse.find({});
  // console.log(apiResponse);
  return res.json({ apiResponse });
});
app.get("/get/scrapingant", async (req, res) => {
  const apiResponse = await ApiResponseScrapingAnt.find({});
  // console.log(apiResponse);
  return res.json({ apiResponse });
});
app.get("/get/zenrows", async (req, res) => {
  const apiResponse = await ApiResponseZenrows.find({});
  // console.log(apiResponse);
  return res.json({ apiResponse });
});
// Call fetchDataAndSave every 15 minutes
setInterval(fetchDataAndSave, 15 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
