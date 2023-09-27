import React, { useState, useEffect } from "react";
import styles from './search.module.css';

import SVGServer from "../../../services/svg/svgServer";
import { Form } from "../form";
import Helpers from "../../../util/Helpers";
import DateGenerator from "../../../services/generators/DateGenerator";

function Person({data, page}) {
    const [userLiked, setUserLiked] = useState(data.userLiked)

    const handleLikeButtonClick = async () => {
        if (!page.socket) return;
        if (userLiked) setUserLiked(false)
        else setUserLiked(true)

        if (page.activeUser.accountID !== data.accountID) page.socketMethods.socketEmitter(userLiked ? "DELETE_HEART" : "CREATE_HEART", {
            accountID: page.activeUser.accountID,
            userID: data.accountID
        })
    }

    return (
        <div className={styles.searchResultPerson} key={data.accountID}>
            <div className={styles.searchResultPersonProfile} style={{backgroundImage: `url(${data.profileImage.url})`}} onClick={() => page.router.push(`/user/${data.accountID}`)}></div>
            <span className={styles.searchResultPersonName} onClick={() => page.router.push(`/user/${data.accountID}`)}>{data.firstName} {data.lastName}<br /><span>{data.nickname}</span></span>

            { 
                data.settings.followable ? 
                    <div className={styles.searchResultPersonHeart} onClick={() => handleLikeButtonClick()}>
                    {
                        userLiked ?
                        <SVGServer.HeartFilledIcon color="var(--accent)" width="30px" height="30px" /> :
                        <SVGServer.HeartLineIcon color="var(--accent)" width="30px" height="30px" />
                    }
                    </div>
                : null
            }
        </div>
    )
}

function Community({data, page}) {
    const [applied, setApplied] = useState(data.userApplied || false)
    const [communityData, setCommunityData] = useState(data)

    useEffect(() => {
        setCommunityData(data)
    }, [data])

    const handleClickButton = async () => {
        if (communityData.userMember) page.router.push(`/communities/${communityData.communityID}`)
        if (communityData.userApplied) return;
        else {
            if (communityData.entryApproval) {
                const createdApplication = (data) => setApplied(true)
                if (page.socket) page.socketMethods.socketRequest("CREATE_APPLICATION", {
                    accountID: page.activeUser.accountID,
                    communityID: communityData.communityID
                }, createdApplication)
            } else {
                const createdMember = (data) => {
                    setCommunityData({ ...communityData, memberCount: communityData.memberCount + 1 })
                }
                if (page.socket) page.socketMethods.socketRequest("CREATE_MEMBER", {
                    accountID: page.activeUser.accountID,
                    communityID: communityData.communityID
                }, createdMember)
            }
        }
    }

    return (
        <div className={styles.searchResultCommunity} key={communityData.communityID}>
            <div className={styles.searchResultCommunityProfile} style={{backgroundImage: `url(${communityData.profileImage.url})`}} onClick={() => page.router.push(`/communities/${data.communityID}`)}></div>
            <div className={styles.searchResultCommunityData}>
                <span className={styles.searchResultCommunityName} onClick={() => page.router.push(`/communities/${data.communityID}`)}>{communityData.displayName}</span>
                <span className={styles.searchResultCommunityDataStats}> 
                    {communityData.privacy}
                    <span></span>
                    {communityData.memberCount} Members
                    <span></span>
                    {communityData.echoCount} {communityData.echoCount > 1 ? "Echoes" : "Echo"}
                </span>
                {
                    communityData.blockedUser ?
                    <span className={styles.searchResultCommunityButton} style={{backgroundColor: "var(--alt)", color: "white", opacity: "0.7"}}>Unavailable</span>
                    :
                    communityData.userMember ?
                    <span className={styles.searchResultCommunityButton} onClick={() => handleClickButton()}>View Community</span> :
                    <span className={styles.searchResultCommunityButton} style={{backgroundColor: applied ? "var(--base)" : null, color: applied ? "var(--primary)" : null}} onClick={() => !applied ? handleClickButton(data) : null}>{applied ? "Applied" : communityData.entryApproval ? "Apply to Join" : `Join Community`}</span>
                }
            </div>
        </div>
    )
}

export default function Search({toggle, control, page}) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState([])
    const [searchClass, setSearchClass] = useState("people")
    const [searchLoader, setSearchLoader] = useState(true)
    const [searchPage, setSearchPage] = useState(1)
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
    })

    useEffect(() => {
        const updateResults = (data) => {
            if (data.success) {
                Helpers.setPaginatedState(data.data, setResults, data.pagination, searchClass === "people" ? "accountID" : "communityID")
                setPagination(data.pagination)
            }
            setSearchLoader(false)
        }
        if (page.socket && query.length > 2 && query.length % 2 === 0) {
            if (searchClass === "people") page.socketMethods.socketRequest("GET_ACCOUNTS", {
                accountID: page.activeUser.accountID,
                filter: query,
                page: searchPage,
                pageSize: 10
            }, updateResults)
            if (searchClass === "communities") page.socketMethods.socketRequest("GET_COMMUNITIES", {
                accountID: page.activeUser.accountID,
                filter: query,
                page: searchPage,
                pageSize: 10
            }, updateResults)
        }
    }, [page.socket, query, searchPage, searchClass])

    useEffect(() => {
        setSearchPage(1)
        setSearchLoader(true)
    }, [query])

    const switchClass = (selectedClass) => {
        setPagination({
            page: 1,
            pageSize: 10,
            totalItems: 0,
            totalPages: 1
        })
        setSearchPage(1)
        setSearchClass(selectedClass)
        setResults([])
        setSearchLoader(true)
    }

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
        if (isAtBottom && searchPage < pagination.totalPages && !searchLoader) {
          setSearchPage(searchPage + 1);
          setSearchLoader(true)
        }
    };

    return (
        <>
        <div className="modalOverlay" style={{display: toggle ? "block" : "none"}} onClick={() => control(false)}></div>
        <div className={styles.searchContainer} style={{right: !toggle ? "-700px" : null}} onScroll={handleScroll}>
            <div className={styles.searchContainerHead}>
                <span className={styles.searchContainerTitle}><span className="titleGradient">Search</span></span>
                <span className={styles.searchContainerClose} onClick={() => control(false)} style={{ transform: "scale(1.3,1.3)" }}><SVGServer.CloseIcon color="var(--primary)" width="30px" height="30px" /></span>
            </div>
            
            <input type="text" className={styles.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search echoes, people, and communities..." />
            
            <div className={styles.searchClassBox}>
                <span className={styles.searchClass} style={{backgroundColor: searchClass === "people" ? "var(--secondary)" : null, color: searchClass === "people" ? "var(--surface)" : null}} onClick={() => switchClass("people")}>People</span>
                <span className={styles.searchClass} style={{backgroundColor: searchClass === "communities" ? "var(--secondary)" : null, color: searchClass === "communities" ? "var(--surface)" : null}} onClick={() => switchClass("communities")}>Communities</span>
            </div>
            <div className={styles.searchResult}>
                { results.length > 0 ? <span className={styles.searchResultTitle}>Results</span> : null }
                {
                    searchClass === "people" && results.length > 0 ?
                    results.map((person, index) => 
                        <Person data={person} page={page} key={index} />
                    ) : null
                }
                {
                    searchClass === "communities" && results.length > 0 ?
                    results.map((community, index) => 
                        <Community data={community} page={page} key={index} />
                    ) : null
                }
                
                { searchLoader && query ? 
                    <div className="loader" style={{
                        width: "50px",
                        height: "50px",
                        borderWidth: "5px",
                        borderColor: "var(--primary) transparent",
                        margin: "50px calc(50% - 25px) 0px calc(50% - 25px)"
                    }}></div>  : null
                }
                { results.length < 1 && !searchLoader ? <span className={styles.searchNullResults}>No results.</span> : null }
            </div>
        </div>
        </>
    )
}