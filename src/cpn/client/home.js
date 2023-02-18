import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Navbar, Horizon } from './../navbar';

export default () => {
    const dispatch = useDispatch();
    const { navState } = useSelector( state => state );


    useEffect( () => {
        dispatch({
            type: "setNavBarHighLight",
            payload: { url_id: 0 }
        })
    }, [])

    return(
        <div className="fixed-default fullscreen main-bg overflow flex flex-no-wrap">
            <Navbar />
            <div className={`app fixed-default overflow ${ !navState ? "app-stretch": "app-scaled" }`} style={{ height: "100vh" }}>
                <Horizon />



                <span className="text-24-px p-1">Home</span>
                <div style={{ height: "200vh" }}></div>



            </div>
        </div>
    )
}
