import { Router } from "express";
import { searchDesigners, searchServices } from "../controllers/search.controller.js";

const searchRouter = Router();

searchRouter.get("/designers", searchDesigners);
searchRouter.get("/services", searchServices);

export default searchRouter;
