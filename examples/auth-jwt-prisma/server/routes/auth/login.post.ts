import { createJwtToken } from "~~/jwt";
import { prisma } from "~~/db";
import bcrypt from "bcrypt";

export default defineEventHandler(async (event)=>{
   const {email, password} = await useBody(event);

   //Check if the user exists
   const user = await prisma.user.findUnique({
      where: {
         email: email
      }
   });

   if(user){
      //Check if the password hash matched
      const match = await bcrypt.compare(password, user.password);

      if(match){
         //Successfully login
         //Create a JWT token
         const token = await createJwtToken();

         setCookie(event, "token", token);

         //Store his last Login IP Address and time
         const lastLoginIpAddress = event.req.headers.hasOwnProperty('x-forwarded-for') ? event.req.headers['x-forwarded-for'].toString() : '127.0.0.1';

         const updateUser: any = await prisma.user.update({
            where: {
               email: email
            }, 
            data: {
               last_login_ip_address: lastLoginIpAddress,
               last_logged_in_at: new Date()
            }
         });
 
         //Remove the password and salt from the object
         delete updateUser.password;
         delete updateUser.salt;
         
         //Store encrpted user data in cookie
         setCookie(event, "user", JSON.stringify(updateUser));

         //Disconnect Prisma
         prisma.$disconnect();
 
         //Add token and success attributes to the object
         updateUser.token = token;
         updateUser.success = true;

         return updateUser;
      }else{
         return {
            message: `The user with email "${email}" does not exist or the password does not match`,
            success: false
         }
      }
   }else{
      //Disconnect Prisma
      prisma.$disconnect();

      return {
         message: `The user with email ${email} does not exist or the password does not match`,
         success: false
      }
   }
});