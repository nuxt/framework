<template>
    <main>
        <div class="container">
            <h2>Nuxt JWT Prisma Register Page</h2>
            <h4>{{ register_message }}</h4>
            <form @submit.prevent="register">
                <div class="form-group">
                    <input id="name" style="width: 100%; text-align: center;" type="text" v-model="name" placeholder="Name" required />
                </div>
                <div class="form-group">
                    <input id="surname" style="width: 100%; text-align: center;" type="text" v-model="surname" placeholder="Surname" required />
                </div>
                <div class="form-group">
                    <input id="email" style="width: 100%; text-align: center;" type="email" v-model="email" placeholder="Email" required />
                </div>
                <div class="form-group">
                    <input id="phone" style="width: 100%; text-align: center;" type="tel" v-model="phone" placeholder="Phone" required />
                </div>
                <div class="form-group">
                    <input id="password" style="width: 100%; text-align: center;" type="password" v-model="password" placeholder="Password" required />
                </div>
                <div class="form-group">
                    <input id="confirm-password" style="width: 100%; text-align: center;" type="password" v-model="confirm_password" placeholder="Confirm Password" required />
                </div>
                <div class="justify-content-center mt-3">
                    <button :class="{'btn-grey': !name || !surname || !email || !password || !phone || !confirm_password || password != confirm_password}" v-bind="{'disabled':!name || !surname || !email || !password || !phone || !confirm_password || password != confirm_password}" type="submit">{{ register_button_label }}</button>
                </div>
                <div class="justify-content-center mt-3">
                    <a href="/login">Login</a>
                </div>
            </form>
        </div>
    </main>
</template>

<script setup lang="ts">
    definePageMeta({
        middleware: ["not-auth"]
    });

    const name = ref();
    const surname = ref();
    const email = ref();
    const phone = ref();
    const password = ref();
    const confirm_password = ref();
    const register_message = ref();
    const register_button_label = ref("REGISTER");

    const register = async ()=>{
        register_button_label.value = "Loading...";

        await $fetch('/auth/register', { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name.value,
                surname: surname.value,
                email: email.value,
                phone: phone.value,
                password: password.value
            }) 
        }).then((data: any)=>{
            //On registration success
            if(data.success){
                //Reset HTML elements
                register_button_label.value = "REGISTER";
                register_message.value = "Your Registration was Successful"

                //Reset Input fields
                name.value = null;
                surname.value = null;
                email.value = null;
                phone.value = null;
                password.value = null;
                confirm_password.value = null;
            }else{
                // Login failed
                register_button_label.value = "REGISTER";

                register_message.value = data.message;
            }
        }).catch((error)=>{
            console.log(error);
            //Error
            register_button_label.value = "REGISTER";
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