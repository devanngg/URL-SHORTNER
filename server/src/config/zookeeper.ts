import ZooKeeper from 'zookeeper';
import {generateBase64Token} from "../utils/index.js"



const {ZOOKEEPER_HOST,ZOOKEEPER_DOCKER_PORT} = process.env
const host = `${ZOOKEEPER_HOST}:${ZOOKEEPER_DOCKER_PORT}`

let client : ZooKeeper | null
const TOKEN_NODE_PATH = "/tokens"


const MAX_RETRIES=3
const MAX_TOKEN_SIZE=6;

const createPersistentNode = async (path: string, data: Buffer): Promise<void> => {
    try {
        await getZookeeperClient().create(path, data, ZooKeeper.constants.ZOO_PERSISTENT);
    } catch (error: any) {
        if (error.code === ZooKeeper.constants.ZNODEEXISTS) {
            console.warn(`Node already exists at: ${path}`);
            return;
        }
        throw error;
    }
};
const getZookeeperClient = (): ZooKeeper =>{    
if(!client){
    const config = {
        connect:host,
        timeout:5000,
        debug_level:ZooKeeper.constants.ZOO_LOG_LEVEL_WARN,
        host_order_deterministic:false
    }

    client = new ZooKeeper(config);
}
return client;
}


// connecting to zookeeper 

export const connectToZookeeper =  async():Promise<void>=>{
    const client = getZookeeperClient()

    await new Promise<void>((resolve,reject)=>{
        client.connect(client.config,async (error)=>{
            if(error){
                console.error("Error connecting to Zookeeper:",error)
                reject();
            }
            console.log("Successfully Connected to the ZooKeeper")
            await createTokensNode();
            resolve();
        })
    })
}

const createTokensNode = async (): Promise<void> =>{
    const client = getZookeeperClient();

    const doesTokenNodeExist =  await client.pathExists(TOKEN_NODE_PATH,false)
    

    if(doesTokenNodeExist){
        console.info(`Tokens node ${TOKEN_NODE_PATH} already exist`)
        return 
    }
    await new Promise<void>((resolve,reject)=>{
        client.mkdirp(TOKEN_NODE_PATH,(error)=>{
            if(error){
                console.error(`Failed to create tokens node ${error}`);
               return  reject(error);
            }
            console.info(`Tokens node ${TOKEN_NODE_PATH} created`)
            resolve();
        })
    })
    console.log(`Successfully connected to zookeeper`)
}
// creating a node
const createNode = async (path:string, data:Buffer):Promise<void> =>{
    await getZookeeperClient().create(path, data, ZooKeeper.constants.ZOO_PERSISTENT);
    console.info(`Node ${path} created`);
}

// generate a unique token with retries for collision detection

export const generateUniqueToken = async (retryCount =0): Promise<string>=>{
    const token = generateBase64Token(MAX_TOKEN_SIZE);
    const uniqueTokenPath = `${TOKEN_NODE_PATH}/${token}`

// create a child node with the generated token
    try {
        // Check if the unique token node already exist 
await createPersistentNode(uniqueTokenPath,Buffer.from(token))
console.info(`Node ${uniqueTokenPath} created`)
return token 
// const doesUniqueTokenNodeExist = await client.pathExists(
//     uniqueTokenPath,
//     false
// )
// if(doesUniqueTokenNodeExist){
//     if(retryCount<MAX_RETRIES){
//         console.log(
//                 `Token collision detected for path:${uniqueTokenPath}.
//                 Retrying... Attempt${retryCount+1} of ${MAX_RETRIES}`
//         )
    
//     return await generateUniqueToken(retryCount+1)
// } else{
//     throw new Error(
// `Failed to generate a unique token after ${MAX_RETRIES} attempts due to collision `
//     )
// }
// }
// // if it doesnt exist create the node
// await createNode(uniqueTokenPath,Buffer.from(token));
// return token; //  return the unique token on success
//     }
 }
  catch (error:any){
    if(error.code===ZooKeeper.constants.ZNODEEXISTS && retryCount<MAX_RETRIES){
        console.warn(`Collision detected for ${token}. Retrying...`)
return await generateUniqueToken(retryCount+1)
    }
    console.error(`Failed to generate token: ${error}`)
    throw error;
    }
}
// End of the file for now 