<template>
    <main>
        <div class="container">
            <h2>Nuxt JWT Prisma Login Page</h2>
            <h3 class="mt-3">Sign in to continue.</h3>
            <h4>{{ login_message }}</h4>
            <form @submit.prevent="login">
                <div class="form-group">
                    <input id="email" style="width: 100%; text-align: center;" type="email" v-model="email" placeholder="Email" required />
                </div>
                <div class="form-group">
                    <input id="password" style="width: 100%; text-align: center;" type="password" v-model="password" placeholder="Password" required />
                </div>
                <div class="justify-content-center mt-3">
                    <button :class="{'btn-grey': !email || !password}" v-bind="{'disabled': !email || !password}" type="submit">{{ login_button_label }}</button>
                </div>
                <div class="justify-content-center mt-3">
                    <a href="/register">Register</a>
                </div>
            </form>
        </div>
    </main>
</template>

<script setup lang="ts">
    definePageMeta({
        middleware: ["not-auth"]
    });

    const email = ref();
    const password = ref();
    const login_message = ref();
    const login_button_label = ref("SIGN IN");

    const login = async ()=>{
        login_button_label.value = "Loading...";

        await $fetch('/auth/login', { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            }) 
        }).then((data: any)=>{
            console.log(data);
            //On login success
            if(data.success){
                //Go to home page
                window.location.href = "/";
            }else{
                // Login failed
                login_button_label.value = "SIGN IN";

                login_message.value = data.message;
            }
        }).catch((error)=>{
            console.log(error);
            //Error
            login_button_label.value = "Loading...";
        });
    }
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