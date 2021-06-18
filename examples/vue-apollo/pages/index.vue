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
import { useQuery, useResult } from '@vue/apollo-composable/dist'

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
    const users = useResult(result)

    return { users }
  }
})
</script>
