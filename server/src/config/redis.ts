import {Redis} from "ioredis"


const {REDIS_HOST,REDIS_DOCKER_PORT} = process.env


export enum RedisExpirationMode {
    EX="EX" // EXPIRE IN SECONDS
}


let client: Redis | null = null;
/// GETIING THE REDDIS CLIENT
const getRedisClient = (): Redis => {
    if (!client) {
   const config = {
    host :REDIS_HOST,
    port:Number(REDIS_DOCKER_PORT),
    maxRetriesPerRequest :null
   }
   client = new Redis(config)
    }
    return client;
}
// CONNECTING TO REDIS 
export const connectToRedis = async (): Promise<void> =>{
    const client = getRedisClient();

    client 
    .on("connect",()=>{
        console.log("Successfully connect to redis")
    })
    .on('error',(error)=>{
        console.error("Error on redis",error.message)
    })
};
// SET A KEY/VALUE PAIR
export const set =  async (
    key :string,
    value: string,
    expirationMode:RedisExpirationMode,
    seconds:number
): Promise <void> =>{
    try {
        await getRedisClient().set(key,value,expirationMode,seconds)
        console.log(`Key ${key} created in redis cache`)
    }
    catch (error){
        console.error(`Failed to create key in Redis cache ${error}`)
    }
}
// Getting a value from a key
export const get = async(key:string) : Promise<string | null> =>{
    try { 
const value = await getRedisClient().get(key)
console.info(`Value with key ${key} retrived from redis cache`);
return value;
    }
    catch (error){
        console.error( `Failed to retrive data value with key ${key} in redis cache ${error}`)
        return null
    }
}
// EXTEND TTL OF A KEY
export const ExtendTTL = async (
    key :string,
    additionalTimeinSeconds:number
)=>{
    // GET THE CURRENT TTL OF THE KEY 
    const currentTTL = await getRedisClient().ttl(key);

    if(currentTTL>0){
        //CALCULATE THE NEW TTL 
        const newTTL = currentTTL + additionalTimeinSeconds;
// SET THE NEW TTL
        await getRedisClient().expire(key,newTTL);
        console.info(`TTL for key ${key} extended to ${newTTL} in new Redis cache`)
    }
    else{
    console.error(`Failed to extend TTL OF KEY ${key} in redis cache`)
    }
}

