import React from "react";
import styled from 'styled-components';
import PersonPhoto from "./PersonPhoto";

export default function AuthenticatedPerson({ person }) {
    const location = person.currentLocation;

    return (
        <ProfileContainer>
            <a href="https://www.recurse.com/settings/profile"
                target="_blank" 
                rel="noopener noreferrer"
            >
                <ProfilePhoto {...person}/>
            </a>
            { location && 
                <LocationContainer>
                    <LocationText>📍{location}</LocationText>
                    <a href="https://www.recurse.com/settings/profile"
                        target="_blank" 
                        rel="noopener noreferrer"
                    >(Edit location)</a>
                </LocationContainer>
            }
        </ProfileContainer>
    )
}

const ProfileContainer = styled.div`
    font-size: 10px;
    display: flex;
    flex-direction: column;
    align-items: end;
`
const LocationContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: end;
`
const LocationText = styled.div`
    white-space: nowrap;
    padding-right: 2px;
    margin-top: 2px;
`
const ProfilePhoto = styled(PersonPhoto)`
    height: 10px;
    width: 10px;
`