export default defineNuxtRouteMiddleware (async (to, from) => {
  const { data: { success } } = await me();

  if(success){
    //Redirect to the home page 
    return navigateTo('/');
  }else{
    return true;
  }
});

const me = async () => {
  const token = useCookie('token').value || "";
  
  return await $fetch('/auth/me', { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        token: token
    }) 
  }).then((data: any)=>{ 
    return {
      data,
      success: true
    };
  }).catch((error)=>{
    console.log(error);

    return {
      data: {},
      success: false
    }
  });
}
