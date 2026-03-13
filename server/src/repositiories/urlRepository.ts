import Url from "../models/Url.js"
import type {IUrl} from "../models/Url.js"

interface ICreateParams {
    shortenUrlKey :string
    originalUrl:string
    originalUrlKey:string
}

interface IFindOneParams{
    shortenUrlKey?:string
    originalUrlKey?:string
}


// create a shortned url 

const create = async (params:ICreateParams):Promise<IUrl> =>{
    console.log(`Creating url with params: ${JSON.stringify(params)}`);
const result:IUrl =  await Url.create({...params});
console.log(`Created URL:${JSON.stringify(result)}`);
return result;
}


// Find all urls
const FindAll = async ():Promise<IUrl[]>=>{
    console.log("Finding  all URLS");
    const result :IUrl[] = await Url.find();
    console.log(`Found URLs :${result?.length||0}`)
    return result 
}

// Finding a specific URL


const findOne = async(params:IFindOneParams):Promise<IUrl | null> =>{
    console.log(`Finding one URL with params:${JSON.stringify(params)}`)
    const result : IUrl | null = await Url.findOne({...params})
    console.log(`Found URL ${JSON.stringify(result)}`);
    return result;
}

const updateClickStats = async(shortenUrlKey:string):Promise<void>=>{
    await Url.updateOne(
        {shortenUrlKey},
        {
            $inc:{clickCount:1},$set:{lastAccessedAt:new Date()}
        }
    )
}
export {create,FindAll,findOne,updateClickStats}