import { checkJwtToken } from "~~/jwt";

export default defineEventHandler(async (event)=>{
    const { token } = await useBody(event);
    
    const isValid = await checkJwtToken(token).then((data: any)=>{
        const cookie = getCookie(event, 'user') || "{}";
        const user = JSON.parse(cookie);
        const res = {
            user: user,
            success: data.success
        }
             
        return res;
    });
    
    return isValid;
});