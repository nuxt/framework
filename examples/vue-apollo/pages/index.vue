<template>
  <div>
    <div v-for="user in users" :key="user.id">
      {{ users.firstname }} {{ users.lastname }}
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'

export default defineComponent({
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
