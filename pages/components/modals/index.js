import React from "react";

import EchoViewer from "../echo-viewer";
import EchoCreator from "../echo-creator";
import Notifications from "../notifications";
import Alert from "../alert";
import TopNav from "../topnav";
import LeftNav from "../leftnav";
import RightNav from "../rightnav";
import NodeCreator from "../node-creator";
import CommunityCreator from "../community-creator";
import MediaViewer from "../media-viewer";
import Messenger from "../messenger";
import Chat from "../chat";
import Search from "../search";
import BottomNav from "../bottomnav";
import EchoConversation from "../echo-conversation";

export default function Modals({page}) {
    return (
        <>
            {
                page.setShowSearch ?
                <Search toggle={page.showSearch} control={page.setShowSearch} page={page} />
                : null
            }
            {
                page.setShowEchoViewer ?
                <EchoViewer data={page.showEchoViewer} control={page.setShowEchoViewer} page={page} />
                : null
            }
            {
                page.setShowEchoComments ?
                <EchoConversation data={page.showEchoComments} control={page.setShowEchoComments} page={page} />
                : null
            }
            {
                page.setShowEchoCreator ?
                <EchoCreator toggle={page.showEchoCreator} control={page.setShowEchoCreator} page={page} />
                : null
            }
            {
                page.setShowNotifications ?
                <Notifications toggle={page.showNotifications} control={page.setShowNotifications} page={page} />
                : null
            }
            {   
                page.setShowNodeCreator ? 
                <NodeCreator toggle={page.showNodeCreator} control={page.setShowNodeCreator} page={page} />
                : null
            }
            {   
                page.setShowCommunityCreator ? 
                <CommunityCreator toggle={page.showCommunityCreator} control={page.setShowCommunityCreator} page={page} />
                : null
            }
            {
                page.setShowMediaViewer ?
                <MediaViewer data={page.showMediaViewer} control={page.setShowMediaViewer} page={page} />
                : null
            }
            {
                page.setShowMessenger ?
                <Messenger toggle={page.showMessenger} control={page.setShowMessenger} page={page} />
                : null
            }
            {
                page.setShowChat ?
                <Chat toggle={page.showChat} data={page.activeChat} page={page} />
                : null
            }
            {   
                page.alert ? 
                <Alert type={page.alert.type} message={page.alert.message} /> 
                : null
            }
            <TopNav page={page} />
            <LeftNav page={page} />
            <RightNav page={page} />
            <BottomNav page={page} />
        </>
    )
}