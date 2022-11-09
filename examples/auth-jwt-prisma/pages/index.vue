<template>
    <main>
        <div class="container">
            <h2>Welcome</h2>
            <h3>{{ _id }}</h3>
            <h3>{{ _name }}</h3>
            <h3>{{ _surname }}</h3>
            <h3>{{ _email }}</h3>
            <h3>{{ _phone }}</h3>
            <h3>{{ _created_at }}</h3>
            <div class="justify-content-center mt-3">
                <button @click.prevent="logout" class="btn-grey">Log Out</button>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
    definePageMeta({ 
        middleware: ["auth"]
    });

    const _id = ref();
    const _name = ref();
    const _surname = ref();
    const _email = ref();
    const _phone = ref();
    const _created_at = ref();

    const me = async () => {
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
    }

    const logout = async () => {
        let { success } = await $fetch('/auth/logout', { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }).then((data: any)=>{
            return data;
        }).catch((error)=>{
            console.log(error);
        });

        if(success){
            window.location.href = '/';
        }
    }

    onMounted(async ()=>{
        //Get user data that was stored in the cookie
        const { user: { id, name, surname, email, phone, created_at } } = await me();

        _id.value = id;
        _name.value = name;
        _surname.value = surname;
        _email.value = email;
        _phone.value = phone;
        _created_at.value = created_at;
    });

</script>

<style scoped>
     main {
        display: flex;
        width: 100vw;
        height: 100vh;
    }

    .container {
        margin: auto;
        border: 3px solid blue;
        padding: 80px;
        border-radius: 12px;
        width: 50vw;
    }

    .container form {
        display: contents;
        width: 30vw;
    }

    .container form input {
        margin-top: 8px;
        height: 50px;
        border: 3px solid black;
        border-radius: 33px;
        font-size: 22px;
    }

    .container form input:hover {
        border: 3px solid blue;
    }

    a:hover {
        color: blue;
    }

    h2, h3 {
        display: flex;
        justify-content: center;
    }

    h2 {
        font-size: 34px;
    }

    h3 {
        font-size: 18px;
    }

    h4 {
        background: yellow;
        text-align: center;
    }

    button {
        cursor: pointer;
        padding: 8px;
        border-radius: 5px;
        color: white;
        background-color: blue !important;
        font-size: 22px;
    }

    .btn-grey {
        background-color: gray !important;
    }

    .justify-content-center {
        display: flex;
        justify-content: center;
    }
</style>