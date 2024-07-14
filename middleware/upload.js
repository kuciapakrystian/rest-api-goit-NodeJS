import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { HttpError } from "../helpers/HttpError.js";

const destination = path.resolve("tmp");

const storage = multer.diskStorage({
  destination,
  filename: (req, file, cb) => {
    const uniquePrefix = `${uuidv4()}`;
    const filename = `${uniquePrefix}_${file.originalname}`;
    cb(null, filename);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5,
};

const fileFilter = (req, file, cb) => {
  const extension = req.originalname.split(".").pop();
  if (extension === "exe") {
    cb(HttpError(400, ".exe not valid extension"));
  }
};

const upload = multer({
  storage,
  limits,
  // fileFilter,
});

export default upload;