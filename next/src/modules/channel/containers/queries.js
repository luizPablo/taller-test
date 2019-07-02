import gql from 'graphql-tag'

export const queryMessagesList = gql`
query Messages ($channel: String!) {
  messages: messageQuery(
    limit: 50
    filter: {
      conditions: [{
        field: "channel"
        value: [$channel]
      }]
    }
  ) {
    count
    entities {
      id
      author: entityOwner {
        name
      }
      ... on Message {
        message: body {
          value
        }
      }
    }
  }
}
`

export const createMessage = gql`
  mutation CreateMessage ($user: String!, $channel: String!, $body: String!) {
    createMessageMessage(input: {
      userId: { targetId: $user }
      body: { value: $body }
      channel: { targetId: $channel }
    }) {
      errors
      violations {
        message
        path
        code
      }
      entity {
        entityId
      }
    }
  }
`