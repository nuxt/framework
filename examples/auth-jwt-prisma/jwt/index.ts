import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const env = dotenv.config({path: '.env'});

if(env.error){
    throw env.error
}

const { JWT_TOKEN_SECRET } = env.parsed;

export const createJwtToken = async ()=>{
    return jwt.sign({success: true}, JWT_TOKEN_SECRET, {expiresIn: "30d"});
}

export const checkJwtToken = async (token: string)=>{
    return jwt.verify(token, JWT_TOKEN_SECRET, (err, decoded)=>{
        if(err) {
            let { name, message } = err;
            return {
                name: name,
                message: message,
                success: false
            }
        }

        return decoded;
    });
}