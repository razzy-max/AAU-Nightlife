import React from 'react'
import { Link } from 'react-router-dom'
import './App.css'

const Event = () => {
  return (
    <div className="full-width-container">
      <h1 className="main-text">This is the Main Text</h1>
      <p className="sub-text">This is some subtext that gives more context.</p>
      <Link to="/target-page" className="read-more-link">
        Read More →
      </Link>
    </div>
  )
}

export default Event
