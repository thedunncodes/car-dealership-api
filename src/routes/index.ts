import { Router } from "express";
import AuthController from "../controllers/AuthController";
import AppController from "../controllers/AppController";
import UserController from "../controllers/UserController";
import AdminController from "../controllers/AdminController";

const router = Router();

router.get("/", AppController.home);

router.get("/stat", AppController.stat);

router.post("/register", UserController.userReg);

router.post("/admin/register/:adminSlug", AdminController.adminReg);

router.post("/login", AuthController.login);

router.get("/admin/staff", AdminController.getStaff);

router.delete("/admin/delete/:staffId", AdminController.deleteStaff);

router.get("/user", UserController.getUser);

router.put("/user/update", UserController.updateUser);

export default router;