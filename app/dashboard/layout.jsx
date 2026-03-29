import React from 'react'
import Header from './_components/Header'

const layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <div className="mx-5 md:mx-20 lg:mx-36 py-6">
        {children}
      </div>
    </div>
  )
}

export default layout