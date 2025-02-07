import express from 'express';
import get_url from '../controller/url.js';
import redirect_url from '../controller/url_get.js'
import url_Analytics from '../controller/url_analytic.js';
import topic_url from '../controller/url_topic.js';
import overall_url from '../controller/url_overall.js';


const route=express.Router();
const route1=express.Router();
const route2=express.Router();

route.post("/",get_url);
route.get("/:alias",redirect_url);

route1.get("/:alias",url_Analytics);
route1.get("/topic/:topic",topic_url);

route2.get("/",overall_url);
export { route, route1 ,route2};
