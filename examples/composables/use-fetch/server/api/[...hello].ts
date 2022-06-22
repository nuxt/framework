import { useQuery } from "h3";

export default event => ({
  path: "/api/" + event.context.params.hello,
  query: useQuery(event)
});
