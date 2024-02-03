import React from 'react'

const TabButton = ({active, selectTab, children}) => {
    const buttonClasses = active ? "text-white border-b border-orange-600 " : "text-[#ADB7E]"

    return (
        <button onClick={selectTab}>
            <p className={`mr-3 font-semibold hover:text-white ${buttonClasses}`}>{children}</p>
        </button>
    )
}

export default TabButton;
