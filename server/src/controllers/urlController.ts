import type {FastifyReply,FastifyRequest} from "fastify"

import {
createdShortnedUrl,
getAllUrls,
getRedirectUrl
}  from "../services/urlService.js"
import { findOne } from "../repositories/urlRepository.js";


// get all shortned urls 

export const getUrls = async (
    _request :FastifyRequest,
    reply:FastifyReply
): Promise<void> =>{
    try {
        const urls = await getAllUrls();
        return reply.code(200).send(urls)
    }
    catch  (error){
        return reply 
        .code(500)
        .send(`Failed to retrive the list of URLs. Please try again later`);
    }
};


/// get a specific url by its keys 

export const getUrl = async(
    request : FastifyRequest<{
        Params:{shortenUrlKey:string}
    }>,
    reply : FastifyReply
):Promise<void>=>{
    try {
        const { shortenUrlKey} = request.params;
        const result = await getRedirectUrl(shortenUrlKey)
        if(!result){
            return reply.code(404).send(`The requested url could not be found`);
        }
        if(result.expired){
            return reply.code(410).send(`This shorternd url has expired`)
        }
        return reply.code(302).redirect(result.url);
    }
    catch (error){
        return reply.code(500).send(`Unable to retrieve the specificed URL`);
    }

}

// post a new URL 

export const postUrl = async (
    request :FastifyRequest<{
        Body:{
            originalUrl :string
        }
    }>,
    reply :FastifyReply
):Promise<void> =>{
    try{
const {originalUrl} = request.body;
const shortenUrlKey = await createdShortnedUrl(originalUrl)
if(!shortenUrlKey){
    return reply.code(400).send(`The provided URL is invalid`)
}
// constructing the full short url 
const shortUrl = `${request.protocol}://${request.hostname}/${shortenUrlKey}`
return reply.code(201).send({shortUrl,code:shortenUrlKey})
    }
    catch (error){
return reply.code(500).send(`Failed to create shortned url`)
    }
}


export const getUrlStats = async(
    request: FastifyRequest<{
        Params:{shortenUrlKey:string}
    }>,
    reply: FastifyReply
): Promise<void>=>{
    try {
        const {shortenUrlKey}= request.params;
        const result = await findOne ({shortenUrlKey});
        if(!result){
            return reply.code(404).send("Stats not found")
        }
        return reply.code(200).send({
            originalUrl: result.originalUrl,
            shortCode: result.shortenUrlKey,
            clickCount: result.clickCount,
            createdAt: result.createdAt,
            lastAccessedAt: result.lastAccessedAt
        });
    } catch (error){
        return reply.code(500).send(`Failed to retrive data`);
    }
}