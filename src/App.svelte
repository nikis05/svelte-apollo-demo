<script>
	import {gql} from 'apollo-boost';
	import {query, mutation} from './apollo'

  const TodosQuery = gql`
    {
      todos {
        id
        title
      }
    }
	`
	const todosStore = query(TodosQuery)

  let newTodoTitle = '';

  $: addTodoStore = mutation(gql`
      mutation AddTodo($title: String!) {
        addTodo(title: $title) {
          id
          title
        }
      }
    `,
    {
      title: newTodoTitle
    },
    (client, result) => {
      if (!result.data) return;
      const cacheData = client.readQuery({query: TodosQuery});
      client.writeQuery({
        query: TodosQuery,
        data: {...cacheData, todos: [...cacheData.todos, result.data.addTodo]}
      })
    }
  )

</script>

<div>
  Todo list
  {#if $todosStore.loading}
    <span>Loading...</span>
  {:else if $todosStore.error}
    <span>Error!</span>
  {:else}
    <ul>
      {#each $todosStore.data.todos as todo (todo.id)}
        <li>{todo.title}</li>
      {/each}
      <li>
        Add an item: <input bind:value={newTodoTitle} />
        <button on:click={() => {$addTodoStore.mutate(); newTodoTitle = '';}}>Add</button>
      </li>
    </ul>
  {/if}
</div>
