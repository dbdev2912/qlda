import { useState, useEffect } from 'react';

export default () => {
    const [ auth, setAuth ] = useState({})

    const enterTriggered = (e) => {
        if( e.keyCode === 13 ){
            submit()
        }
    }

    const submit = () => {        
        fetch("/api/auth/login", {
            method: "post",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(auth),
        }).then( res => res.json() ).then( ({ success, msg }) => {
            if( success ){
                window.location = '/';
            }else{
                alert(msg);
            }
        })
    }

    return(
        <div className="fixed-default flex flex-aligned fullscreen login-bg overflow">
            <div className="flex flex-middle mg-auto login-form">
                <div className="w-60-pct mg-auto" style={{ paddingLeft: "3em" }}>
                    <span className="block text-center upper text-20-px">Đăng nhập</span>
                    <div className="flex flex-wrap">
                        <div className="w-90-pct mg-auto m-t-5 flex flex-no-wrap flex-middle">
                            <input placeHolder="Tài khoản" onKeyUp={ enterTriggered } onChange={ (e) => { setAuth( {...auth, username: e.target.value} ) } } type="text" className="block w-100-pct ml-auto border-radius-12-px border-1 p-0-5"/>
                        </div>
                        <div className="w-90-pct mg-auto m-t-1 flex flex-no-wrap flex-middle">
                            <input  placeHolder="Mật khẩu" onKeyUp={ enterTriggered } onChange={ (e) => { setAuth( {...auth, password: e.target.value} ) } } type="password" className="block w-100-pct ml-auto border-radius-12-px border-1 p-0-5"/>
                        </div>
                        <div className="w-90-pct mg-auto m-t-1 flex flex-no-wrap">
                            <button className="sign-btn w-100-pct pointer" onClick={ submit }>Tiếp tục ➤</button>
                         </div>
                        <div className="w-90-pct mg-auto m-t-5 flex flex-no-wrap flex-middle">
                            <span className="block text-12-px text-right">Khum có tài khoản ? <a href="/signup" className="no-underline mylan-color pointer bold">Đăng ký</a> ngay</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
