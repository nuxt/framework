import { createJwtToken } from "~~/jwt";
import { prisma } from "~~/db";
import bcrypt from "bcrypt";

export default defineEventHandler(async (event)=>{
   const {name, surname, email, phone, password} = await useBody(event);

   //Check if the user exists
   const user = await prisma.user.findUnique({
      where: {
         email: email
      }
   });

   if(user != null){
      //Disconnect Prisma
      prisma.$disconnect();

      return {
         message: `The user with email "${email}" already exists`,
         success: false
      }
   }else{
      //Successfully login
      //Hash password
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);

      const createUser: any = await prisma.user.create({
         data: {
            name: name,
            surname: surname,
            email: email,
            phone: phone,
            password: hash,
            salt: salt,
            last_login_ip_address: "",
            last_logged_in_at: new Date(),
            current_logged_in_at: new Date()
         }
      });

      //Remove the password and salt from the object
      delete createUser.password;
      delete createUser.salt;

      //Disconnect Prisma
      prisma.$disconnect();

      //Add success attributes to the object
      createUser.success = true;

      return createUser;
   }
});