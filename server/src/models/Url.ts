import {Document,Schema,model} from "mongoose"

export interface  IUrl extends Document {
    originalUrl : string
    shortenUrlKey:string,
    originalUrlKey:string,
    createdAt:Date,
    expiresAt:Date,
    clickCount:number,
   lastAccessedAt: Date | null
}

const schema =new Schema <IUrl>({
   originalUrl:{
    type :String,
    required:true,
    unique:true
   },
   originalUrlKey:{
type:String,
required:true,
   },
   shortenUrlKey:{ 
type:String,
required:true,
unique:true
   },
   createdAt:{
type:Date,
default :Date.now
   },
   expiresAt:{
    type:Date,
    default:()=> new Date(Date.now()+10*60*1000)
   },
   clickCount:{
      type:Number,
      default:0
   },
   lastAccessedAt:{
      type:Date,
      default:null
   }
});



export default model<IUrl>('url',schema)