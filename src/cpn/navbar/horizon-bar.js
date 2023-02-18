import { useState, useEffect } from 'react';

const urls = [
    { id: 0, url: "/update/avatar", label: "Thay đổi ảnh đại diện", icon: "user.png",},
    { id: 1, url: "/profile", label: "Hồ sơ cá nhân", icon: "settings.png" },
    { id: 2, url: "/signout", label: "Đăng xuất", icon: "export.png" },
]

export default () => {

    const [ height, setHeight ] = useState(false);

    return(
        <div className="sticky-default z-index-1 w-100-pct shadow horizon-bar p-0-5">
            <div className="avatar-container flex flex-middle ml-auto m-r-1 pointer" onClick={ () => { setHeight( !height ) } }>
                <img src="/assets/image/icon.png" className="w-50-px border-radius-24-px"/>
            </div>
            <div className="rel">
                <div className=" abs t-0 r-0 drop-container no-overflow" style={{ width: "max-content", height: `${ height ? 210: 0 }px`, transition: "ease-in-out 0.25s" }}>
                    <span className="dock z-index-1"/>
                    <div className="bg-white rel border-1 z-index-2" style={{ marginTop: "10px" }}>
                    {
                        urls.map( url =>
                            <div onClick={ () => { window.location = url.url } } className={`flex flex-no-wrap p-0-5 bg-white pointer hover`} key ={ url.id }>
                                <div className="w-72-px pointer order-0">
                                    <div className="block p-0-5">
                                        <img className="w-24-px block mg-auto m-l-0-5" src={`/assets/icon/navbar/${url.icon}`}/>
                                    </div>
                                </div>
                                <div className="w-100-pct p-0-5 order-1">
                                    <span className="text-16-px block p-l-0-5">{url.label}</span>
                                </div>
                            </div>
                        )
                    }
                    </div>
                </div>
            </div>
        </div>
    )
}
