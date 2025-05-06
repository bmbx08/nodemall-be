const express = require("express");
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/",userController.createUser)
router.get("/me",authController.authenticate,userController.getUser)//토큰이 valid한 토큰인지, 이후 token가지고 유저를 찾아서 return

module.exports = router;