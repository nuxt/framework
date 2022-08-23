import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    message: String
  },
  render: (props) => {
    return (
    <div>
      { props.message }
    </div>
    )
  }
})
