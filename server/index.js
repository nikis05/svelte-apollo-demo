const { ApolloServer } = require('apollo-server');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList
} = require('graphql');
const { v4 } = require('uuid');

const data = { todos: [] };

const TodoType = new GraphQLObjectType({
  name: 'Todo',
  fields: () => ({
    id: {
      type: GraphQLID
    },
    title: {
      type: GraphQLString
    }
  })
});

const server = new ApolloServer({
  schema: new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: () => ({
        todos: {
          type: new GraphQLList(TodoType),
          resolve: () => data.todos
        }
      })
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: () => ({
        addTodo: {
          type: TodoType,
          args: {
            title: {
              type: GraphQLString
            }
          },
          resolve: (_root, { title }) => {
            const todo = {
              id: v4(),
              title
            };
            data.todos = [...data.todos, todo];
            return todo;
          }
        }
      })
    })
  })
});

server.listen(4000);
