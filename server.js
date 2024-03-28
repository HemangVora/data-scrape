import * as dotenv from "dotenv";
dotenv.config();
import cloudscraper from "cloudscraper";
import express from "express";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
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
    "Cache-Control": "private",

    "accept-Encoding": "gzip, deflate, br, zstd",
    "content-type": "application/x-www-form-urlencoded",
    "accept-language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    cookie:
      "rl_page_init_referrer=RudderEncrypt%3AU2FsdGVkX1%2FlSN88%2BDLogGHmJLm4uIIkjBymBKbcc9vGzFUcfGam3yaWO0b3HYyM; rl_page_init_referring_domain=RudderEncrypt%3AU2FsdGVkX1%2BgVViISIN3neKvaNS5pn11uMdCiHRNwpg%3D; _ga=GA1.1.482897642.1710265645; _ga_C09NSBBFNH=GS1.1.1710265645.1.1.1710265779.0.0.0; fs_uid=#o-19FFTT-na1#9fa28098-c277-451d-a0d8-b9cbef6ee45b:deeeafd5-a9d4-4907-b240-1f5f3d654712:1710265719842::2#/1734245244; rl_user_id=RudderEncrypt%3AU2FsdGVkX187euB47QC1lMLMzo5X0%2By8QiIUY8CK%2B18%3D; rl_trait=RudderEncrypt%3AU2FsdGVkX18fEHrHZfnkoFxFeVOmxlHnZlzBCT%2FQjs4%3D; rl_group_id=RudderEncrypt%3AU2FsdGVkX19UkqmVtTWkIUB17pIwcT0DnbRKUWX%2FEQk%3D; rl_group_trait=RudderEncrypt%3AU2FsdGVkX1%2BbsUn2Sy7fU6WSgmMtE5XyWwySKTyNTrU%3D; rl_anonymous_id=RudderEncrypt%3AU2FsdGVkX19VsAtYGF7g6CUoUuWY0kgXWsgrqzNbHcKUad37E0zGpkmZdZyS63mZIKBNSElgmAM8MLd2qSljPg%3D%3D; __cf_bm=YOU9LUwlvn55iGk5zvZHYkfK_2OgXcfyPmVk_yrBWg8-1711615149-1.0.1.1-csqflB9bk_BfaTaOWG545xHgwlurkGVzWxIpodjX.QjcVQLpPrE.eEtPrNMGi6mE99J9jUvJjFxs5nLnp2SKMw; rl_session=RudderEncrypt%3AU2FsdGVkX19uq0qjdt5WZBdoHDBPuvgmOgxEQuxZcuIeXukd%2FQN4M56aJ6Eack7oxMGT3T2FH%2BmnSmiKaH%2FeV8IM5mxWDcB0zVtt%2FXF938Z0bAe4CiPajuutOPpLHetspfTCuMHIiRe%2Fe27jb0mQfA%3D%3D",
    "if-none-match": 'W/"5c028-o4ZnxrSRIjtRGGcDnFI7naMthK8"',
    origin: "https://blur.io",
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

  url: "https://core-api.prod.blur.io/v1/blend/active-liens/0xbd3531da5cf5857e7cfaa92426877b022e612cf8",
  method: "GET",
  timeout: {
    send: 5000,
  },
};

async function fetchDataAndSave() {
  try {
    cloudscraper(options)
      .then(async function (data) {
        const apiResponse = new ApiResponse({ data: data });
        await apiResponse.save();
        console.log("Data saved to MongoDB");
      })
      .catch(function (err) {
        console.log(err);
      });
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
  fetchDataAndSave();
  console.log(`Server running on port ${PORT}`);
});
