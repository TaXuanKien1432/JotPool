import React from "react"
import Footer from "../components/Footer"
import MainStart from "../components/MainStart"
import Navbar from "../components/Navbar"

const StartPage:React.FC = () => {
  return (
    <>
        <Navbar />
        <MainStart />
        <Footer />
    </>
  )
}

export default StartPage