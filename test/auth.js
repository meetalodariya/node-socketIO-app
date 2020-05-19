const expect = require("chai").expect,
  authMiddl = require("../middlewares/is-Auth").isauth;
const jwt = require("jsonwebtoken");
describe("AuthMiddleware", function () {
  it("should throw an error", function () {
    const req = {
      get: function () {
        return null;
      },
    };
    expect(authMiddl.bind(this, req, {}, () => {})).to.throw(
      "Authorization failed"
    );
  });
  it("should yield a userID", function () {
    const req = {
      get: function () {
        return "Bearer aksdjfoaj";
      },
    };

    jwt.verify = function () {
      return { userId: "123123123" };
    };
    authMiddl(req, {}, () => {});
    expect(req).to.have.property("userId");
  });
});
