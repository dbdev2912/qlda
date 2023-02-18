import { useState, useEffect } from 'react';

export default () => {
    useEffect(() => {
        fetch('/api/auth/signout').then( res => res.json() )
        .then( data => {
            const { success } = data;
            if( success ){
                window.location = "/login";
            }
        })
    }, [])
    return null
}
