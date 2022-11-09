export default defineEventHandler(async (event)=>{
    setCookie(event, "user", JSON.stringify({ 
        success: false 
    }));

    setCookie(event, "token", JSON.stringify({ 
        success: false 
    }));

    return {
        success: true
    }
});