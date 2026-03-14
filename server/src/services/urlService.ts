import {generateUniqueToken} from "../config/zookeeper.js"
import {get,set,ExtendTTL,RedisExpirationMode} from "../config/redis.js"
import type {IUrl} from "../models/Url.js"
import {isValidUrl} from "../utils/index.js"
import {create,FindAll,findOne,updateClickStats} from "../repositories/urlRepository.js"
const ONE_MINUTE_IN_SECONDS =60;

const calculateTTL =  (expiresAt:Date):number =>{
    const now = new Date();
    const remainingMs = expiresAt.getTime() - now.getTime();
    const remainingSeconds = Math.floor(remainingMs/1000);

    return Math.min(ONE_MINUTE_IN_SECONDS,Math.max(0,remainingSeconds))
}


export const getAllUrls = async (): Promise<IUrl[]>=> await FindAll();

export const getUrlByShortenUrlKey = async (
    shortenUrlKey:string
): Promise<string | null> =>{
    const cachedOriginalUrl = await get(shortenUrlKey);
    if(cachedOriginalUrl){
        await ExtendTTL(shortenUrlKey,ONE_MINUTE_IN_SECONDS)
        return cachedOriginalUrl;
    }
// If not in cache, retrieve from database
const savedUrl = await findOne({shortenUrlKey});
if(savedUrl){
await set(
    savedUrl.shortenUrlKey,
    savedUrl.originalUrl,
    RedisExpirationMode.EX,
    ONE_MINUTE_IN_SECONDS
)
return savedUrl.originalUrl
}
return null;
}

// create a new shortnedUrl 

export const createdShortnedUrl = async (
    originalUrl:string
): Promise<string | null> =>{
    if(!isValidUrl(originalUrl)){
        return null;
    }
    const MAX_RETRIES =3;
    for (let attempt = 0;attempt<MAX_RETRIES; attempt++){
        try {
            const savedUrl = await findOne({originalUrlKey:originalUrl});
            if(savedUrl){
                return savedUrl.shortenUrlKey;
            }
            // generate a new token 
            const shortenUrlKey = await generateUniqueToken();
            if(!shortenUrlKey) return null;

            // try to create the entry;
            const newUrl = await create({
                originalUrl,
                originalUrlKey: originalUrl,
                shortenUrlKey
            });
                        const ttl = calculateTTL(newUrl.expiresAt);

            await set (
                newUrl.shortenUrlKey,
                newUrl.originalUrl,
                RedisExpirationMode.EX,
                ttl
            );
            return newUrl.shortenUrlKey;
        }
        catch (error:any){
            if(error.code === 11000){
                console.warn(`Collision detected on attemps ${attempt+1}.Retrying...`)
                /// on the last attempt if it stil fails let it throw or return null
                if(attempt=== MAX_RETRIES-1){
                    console.error("MAX RETRIES REACHED FOR URL CREATION")
                    return null;
                }
                continue;
            }
            throw error;
        }
    }
    return null;
}
//Handle redirection  stats trackig and cache logic 
    export const getRedirectUrl = async(

        shortenUrlKey:string
    ):Promise<{url:string;expired:boolean}|null>=>{

        const cachedOriginUrl   = await get (shortenUrlKey)
        if(cachedOriginUrl){
            await ExtendTTL(shortenUrlKey,ONE_MINUTE_IN_SECONDS)
            updateClickStats(shortenUrlKey);
            return { url :cachedOriginUrl,expired:false}
        }
        // fallback  retrive from db 

        const savedUrl = await findOne({shortenUrlKey})
        if(savedUrl){
            const isExpired = savedUrl.expiresAt< new Date();
            if(isExpired){
                return { url : savedUrl.originalUrl, expired:true}
            }
            // calculate how long will this live in the cache 
            const ttl = calculateTTL(savedUrl.expiresAt);
            await set ( 
                savedUrl.shortenUrlKey, 
          savedUrl.originalUrl,
          RedisExpirationMode.EX,
          ttl
            );

            updateClickStats(shortenUrlKey);
            return{url : savedUrl.originalUrl,expired:false};
        }
        return null;
    };

   
