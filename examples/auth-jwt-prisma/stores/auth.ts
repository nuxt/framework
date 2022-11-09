import { defineStore } from "pinia";

export const useAuthStore = defineStore('auth', {
  state: () => ({
    name: ""
  }),
  getters: {},
  actions: {
    async me(): Promise<any> {
      const userData = useCookie('user').value || "";
      const token = useCookie('token').value || "";
      
      return await $fetch('/auth/me', { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            token: token
        }) 
      }).then((data: any)=>{ 
        return data;
      }).catch((error)=>{
        console.log(error);
      });
    },
    async logout(): Promise<any>{
      return await $fetch('/auth/logout', { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).then((data: any)=>{
        return data;
      }).catch((error)=>{
        console.log(error);
      });
    }
  }
});

