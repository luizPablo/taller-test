/**
 * This is the page rendered when inside a chat room.
 */

import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Link from 'next/link'

import { HashLoader } from 'react-spinners'
import App from 'grommet/components/App'
import ChatIcon from 'grommet/components/icons/base/Chat'
import RefreshIcon from 'grommet/components/icons/base/Refresh'
import AddCircleIcon from 'grommet/components/icons/base/Add'
import UserIcon from 'grommet/components/icons/base/User'
import LogoutIcon from 'grommet/components/icons/base/Logout'
import Split from 'grommet/components/Split'
import Sidebar from 'grommet/components/Sidebar'
import Header from 'grommet/components/Header'
import Footer from 'grommet/components/Footer'
import Title from 'grommet/components/Title'
import Box from 'grommet/components/Box'
import Menu from 'grommet/components/Menu'
import Anchor from 'grommet/components/Anchor'
import Button from 'grommet/components/Button'
import Paragraph from 'grommet/components/Paragraph'
import Label from 'grommet/components/Label'

import bootstrap from 'app/lib/bootstrap'
import TextInput from 'app/modules/form/components/TextInput'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
//import Router from 'next/router'

const logoutMutation = name => gql`
  mutation{
    user: userLogout (name: "${name}") {
      name
    }
  }
`

const StyledRoomHeader = styled(Header)`
  border-bottom: 1px solid #ddd;
`

const StyledMessage = styled(Paragraph)`
  margin: 0;
`

const StyledAuthor = styled(Label)`
  margin: 0;
`

const StyledTextInput = styled(TextInput)`
  width: 100%;
`

const AddChannelButton = styled(Button)`
  margin-left: auto;
`
const LoadingComponent = () => (
  <Box full='vertical' justify='center' align='center'>
    <HashLoader color='#e02438' loading />
  </Box>
)

import CurrentUserContainer from 'app/modules/auth/containers/CurrentUserContainer'
import ChannelsContainer from 'app/modules/channel/containers/ChannelsContainer'
import MessagesContainer from 'app/modules/channel/containers/MessagesContainer'
import NewMessageContainer from 'app/modules/channel/containers/NewMessageContainer'
import NewChannelContainer from 'app/modules/channel/containers/NewChannelContainer'

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      reload: false,
    }
  }

  static async getInitialProps({ query }) {
    const channel = query.channel ? query.channel : 'general';
    return { channel }
  }

  componentDidMount() {
    if (this.messageList) {
      this.messageList.boxContainerRef.scrollIntoView(false);
    }
  }

  componentDidUpdate() {
    if (this.messageList) {
      this.messageList.boxContainerRef.scrollIntoView(false);
    }
  }

  render() {
    return (
      <CurrentUserContainer>
        {({ user }) => (
          <ChannelsContainer>
            {({ loading, channels }) => (
              (loading && !channels.length) ? <LoadingComponent /> : (
                <App centered={false}>
                  <Split fixed flex='right'>
                    <Sidebar colorIndex='neutral-1'>
                      <Header pad='medium'>
                        <Title>
                          TallerChat <ChatIcon />
                        </Title>

                        <NewChannelContainer channels={channels}>
                          {create => (
                            <AddChannelButton
                              icon={<AddCircleIcon />}
                              onClick={() => create(
                                window.prompt('Name your new channel')
                              )}
                            />
                          )}
                        </NewChannelContainer>
                      </Header>

                      <Box flex='grow' justify='start'>
                        <Menu primary>
                          {channels.map(({ name }) => (
                            <Link key={name} prefetch href={`/messages/general?channel=${name}`} as={`/messages/general`}>
                              <Anchor className={this.props.channel === name ? 'active' : ''}>
                                # <b>{name}</b>
                              </Anchor>
                            </Link>
                          ))}
                        </Menu>
                      </Box>

                      <Footer pad='medium'>
                        <Button icon={<UserIcon />} onClick={console.log} />

                        <Mutation
                          mutation={logoutMutation(user.name)}
                          onCompleted={(data) => {
                            // Router.push('/') don't work :\
                            window.location.replace('/');
                          }}
                        >
                          {logout => <Button icon={<LogoutIcon />} onClick={logout} />}
                        </Mutation>
                      </Footer>
                    </Sidebar>

                    {!user || !user.uid ? (
                      <LoadingComponent />
                    ) : (
                        <MessagesContainer channel={channels.find(({ name }) => name === this.props.channel)}>
                          {({ loading, refetch, messages }) => {

                            setTimeout(() => this.messageList.boxContainerRef.scrollIntoView(false), 500)

                            return (
                              <Box full='vertical' ref={(el) => this.messageList = el}>
                                <StyledRoomHeader fixed pad={{ vertical: 'small', horizontal: 'medium' }} justify='between'>
                                  <Title>
                                    {'#' + this.props.channel}
                                  </Title>

                                  <Button icon={<RefreshIcon />} onClick={() => refetch()} />
                                </StyledRoomHeader>

                                <Box pad='medium' flex='grow'>
                                  {loading ? 'Loading...' : (
                                    messages.length === 0 ? 'No one talking here yet :(' : (
                                      messages.map(({ id, author, message }) => (
                                        <Box key={id} pad='small' credit={author}>
                                          <StyledAuthor>{author}</StyledAuthor>
                                          <StyledMessage>{message}</StyledMessage>
                                        </Box>
                                      ))
                                    )
                                  )}
                                </Box>

                                <Box pad='medium' direction='column'>
                                  {user && user.uid ? (
                                    <NewMessageContainer
                                      user={user}
                                      channel={channels.find(({ name }) => name === this.props.channel)}
                                    >
                                      {({ handleSubmit }) => (
                                        <form onSubmit={handleSubmit}>
                                          <NewMessageContainer.Message
                                            placeHolder={`Message #${this.props.channel}`}
                                            component={StyledTextInput}
                                          />
                                        </form>
                                      )}
                                    </NewMessageContainer>
                                  ) : (
                                      'Log in to post messages'
                                    )}
                                </Box>
                              </Box>
                            )
                          }}
                        </MessagesContainer>
                      )}

                  </Split>
                </App>
              )
            )}
          </ChannelsContainer>
        )}
      </CurrentUserContainer >
    )
  }

};

export default bootstrap(ChatRoom)
