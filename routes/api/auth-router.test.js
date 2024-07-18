import mongoose from "mongoose";
import request from "supertest";
import "dotenv/config";
import app from "../../app.js";
import User from "../../models/Users.js";

const { TEST_DB_HOST, PORT = 3000 } = process.env;

describe("test /api/users/signin", () => {
  let server = null;
  beforeAll(async () => {
    await mongoose.connect(TEST_DB_HOST);
    server = app.listen(PORT);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  // afterEach(async () => {
  //   await User.deleteMany({});
  // });

  test("test signin with correctData", async () => {
    const signInData = {
      email: "kevin@gmail.com",
      password: "111111",
    };

    const { statusCode, body } = await request(app)
      .post("/api/users/signin")
      .send(signInData);

    console.log(signInData, signInData.email, signInData.password);
    console.log("Response status code:", statusCode);
    console.log("Response body:", body);
    console.log("Response body USER:", body.user);

    expect(statusCode).toBe(200);
    expect(body.user.email).toBe(signInData.email);

    const user = await User.findOne({ email: signInData.email });
    expect(user.email).toBe(signInData.email);
  });
});