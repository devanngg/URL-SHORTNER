import type {FastifyInstance} from "fastify"
import {postUrl,getUrl,getUrls,getUrlStats} from "../controllers/urlController.js"


export const urlRoutes  = async (Fastify :FastifyInstance)=>{
    Fastify.register(
async (router:FastifyInstance)=>{
    // gets all urls
    router.get("/",getUrls)
    // one specific url 
    router.get("/:shortenUrlKey",getUrl)
    // create a new shortned url 
    router.post("/",postUrl)
router.get("/stats/:shortenUrlKey", getUrlStats)
},
{prefix:'/urls'}
    )
}