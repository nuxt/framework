<template>
  <div>
    <div v-for="user in users" :key="user.id">
      {{ user.firstname }} {{ user.lastname }}
    </div>
  </div>
</template>

<script>
import { defineNuxtComponent } from '@nuxt/app'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'

export default defineNuxtComponent({
  setup () {
    const { result } = useQuery(gql`
      query getUsers {
        users {
          id
          firstname
          lastname
          email
        }
      }
    `)

    return { users: result }
  }
})
</script>
