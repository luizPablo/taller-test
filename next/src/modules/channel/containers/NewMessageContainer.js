import React from 'react'
import { func, shape, number } from 'prop-types'
import { queryMessagesList, createMessage } from './queries'
import { Mutation } from 'react-apollo'
import { Form, Field } from 'react-final-form'

const NewMessageContainer = ({ children, user, channel }) => (
  <Mutation mutation={createMessage} refetchQueries={[{ query: queryMessagesList, variables: { channel: channel.tid } }]}>
    {send => {
      return (
        <Form
          initialValues={{ user: user.uid, channel: channel.tid }}
          children={children}
          onSubmit={({ body, user, channel }, { reset }) => {
            reset()
            send({
              variables: {
                body,
                user,
                channel,
              }
            })
          }}
        />
      )
    }}
  </Mutation>
)

NewMessageContainer.propTypes = {
  children: func,
  user: shape({ uid: number.isRequired }).isRequired,
  channel: shape({ tid: number.isRequired }).isRequired,
}

/**
 * Composable message field.
 */
NewMessageContainer.Message = props => (
  <Field name='body' {...props} />
)

export default NewMessageContainer
