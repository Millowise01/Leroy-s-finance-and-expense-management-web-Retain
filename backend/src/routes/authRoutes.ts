import { Router } from "express";
import {
  meController,
  signinController,
  signoutController,
  signupController
} from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", signupController);
router.post("/signin", signinController);
router.post("/signout", signoutController);
router.get("/me", requireAuth, meController);

export default router;