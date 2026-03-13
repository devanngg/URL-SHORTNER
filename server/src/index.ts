import Fastify from "fastify"
import fastifyCors from "@fastify/cors"
import type {FastifyInstance} from "fastify"
import {connectToMongoDB} from "./config/moongose.js"
import {connectToRedis} from "./config/redis.js"
import {connectToZookeeper} from "./config/zookeeper.js"
import {urlRoutes} from "./routes/urls.js"

// fastify server instanee

const fastify = Fastify();
// configure server
fastify
.register(fastifyCors)
.register(
    async (fastify:FastifyInstance)=>{
        fastify.register(urlRoutes);
    },
    {prefix:'/api'}
);

const start = async ()=>{
    try {
        await connectToMongoDB();
        await connectToRedis();
        await connectToZookeeper();

        await fastify.listen({
            port :  Number(process.env.NODE_SERVER_LOCAL_PORT)||3000,
            host :process.env.NODE_SERVER_HOST|| '0.0.0.0',
        })
        console.log(`Server is now listening`)
    }
    catch (error)
    {
console.error(`failed to start the serve please ttry again later`,error)
process.exit(1)
    }
}
start();


