//All the apis and axios configuration
 //Author: Divyashree Bangalore Subbaraya (B00875916)
const axios = require("axios");

const port = process.env.PORT || 8080;

const backEndUrl =
  process.env.REACT_APP_BACKEND_HOSTNAME || "http://localhost:8080";

export const awsCredentials = {
  "accessKeyId": process.env.REACT_APP_ACCESS_KEY_ID,
  "secretAccessKey": process.env.REACT_APP_SECRET_ACCESS_KEY,
  "sessionToken": process.env.REACT_APP_SESSION_TOKEN,
   "region": "us-east-1"
}

// export const awsCredentials = {
//   "accessKeyId": "ASIAWOVIHNIJYAYBWAVP",
//   "secretAccessKey": "RjpZizxTnGJXOthsuFPpzXQ6d35c2CB6LjrYRzpE",
//   "sessionToken": "FwoGZXIvYXdzEFwaDJO6UV6NtaPAKWtNoiLNAZ/Rme14l1D/NVa1KaXUnVwsL3fQx4iCGti9fFXy6bKKhODuGJLWsi7cFl6ePL+dcwEj/Wr7xguEFgTR0Up0vuNu0+8gkREAJ8YAtU2NRG0A9r5cVGNqLlgHCGCHNgrmficI5PHw7Y9EwbskvT/GNXCOZNJgXMsBL4tkkKwV17H8YDPDwOasTw1SaG04hulAbknMS0CdWBrZWQss/5aWz1eo0m4Y3v+gQyaHH9m9MQ4oU6R67Jd3Eb1C8gDGSBeKIyen9tFUNkxP7Afw6r4o5vvYjQYyLWpHl7WIgL0PowKagVudgMofovTxC1ktQiY9826B9iJrvjy04N4cTVpSanY/6A==",
//   "region": "us-east-1"
// }

const domain = `${backEndUrl}`;

const axiosInstance = axios.create({
  baseURL: domain,
});

export function saveImage(data, header) {
  return axiosInstance.post(`/gcp/upload`, data, header);
}
