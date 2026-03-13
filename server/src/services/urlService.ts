import {generateUniqueToken} from "../config/zookeeper.js"
import {get,set,ExtendTTL,RedisExpirationMode} from "../config/redis.js"
import type {IUrl} from "../models/Url.js"
import {isValidUrl} from "../utils/index.js"
import {create,FindAll,findOne,updateClickStats} from "../repositiories/urlRepository.js"

const ONE_MINUTE_IN_SECONDS =60;

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
    originalUrl: string
): Promise<string | null> => {
    if (!isValidUrl(originalUrl)) {
        return null;
    }

    // 1. Check if it already exists in DB
    const savedUrl = await findOne({ originalUrlKey:originalUrl });
    if (savedUrl) {
        return savedUrl.shortenUrlKey; 
    }

    // 2. Generate new token if it doesn't exist
    const shortenUrlKey = await generateUniqueToken();
    
    if (shortenUrlKey) {
        const newUrl = await create({
            originalUrl,
            originalUrlKey: originalUrl,
            shortenUrlKey
        });

        // 3. Cache the new entry
        await set(
            newUrl.shortenUrlKey,
            newUrl.originalUrl,
            RedisExpirationMode.EX,
            ONE_MINUTE_IN_SECONDS
        );

        return newUrl.shortenUrlKey;
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
            await updateClickStats(shortenUrlKey);
            return { url :cachedOriginUrl,expired:false}
        }
        // fallback  retrive from db 

        const savedUrl = await findOne({shortenUrlKey})
        if(savedUrl){
            const isExpired = savedUrl.expiresAt< new Date();
            if(isExpired){
                return { url : savedUrl.originalUrl, expired:true}
            }
            await set ( 
                savedUrl.shortenUrlKey, 
          savedUrl.originalUrl,
          RedisExpirationMode.EX,
          ONE_MINUTE_IN_SECONDS
            );

            await updateClickStats(shortenUrlKey);
            return {url : savedUrl.originalUrl,expired:false};
        }
        return null;
    };

   
