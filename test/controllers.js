const expect = require("chai").expect;
const sinon = require("sinon");
const User = require("../models/user");
const signin = require("../controllers/auth").signin;
describe("Controllers", function () {
  it("should throw error if db error is thrown", function () {
    sinon.stub(User, "findOne");
    User.findOne.throws();

    const req = {
      body: {
        email: "asdf",
        password: "asdfa",
      },
    };
    signin(req, {}, () => {}).then((res) => {
      expect(res).to.be.an("error");
    });
  });
});
