import type {FastifyInstance} from "fastify"
import {postUrl,getUrl,getUrls} from "../controllers/urlController.js"


export const urlRoutes  = async (Fastify :FastifyInstance)=>{
    Fastify.register(
async (router:FastifyInstance)=>{
    // gets all urls
    router.get("/",getUrls)
    // one specific url 
    router.get("/:shortenUrlKey",getUrl)
    // create a new shortned url 
    router.post("/",postUrl)

},
{prefix:'/urls'}
    )
}