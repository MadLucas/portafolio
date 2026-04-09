import React from 'react'

const TabButton = ({ active, selectTab, children }) => {
  const buttonClasses = active
    ? 'text-white border-b-2 border-accent-orange -mb-px'
    : 'text-[#8b949e] border-b-2 border-transparent hover:text-white'

  return (
    <button
      type="button"
      onClick={selectTab}
      className={`px-1 pb-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-page ${buttonClasses}`}
    >
      {children}
    </button>
  )
}

export default TabButton
