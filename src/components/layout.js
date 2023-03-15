import React from 'react'
import * as styles from './layout.module.scss'
import Header from './header.js'
import Footer from './footer.js'

const Layout = ({ children }) => (
  <div className={styles.container}>
    <Header />
    <div className={styles.content}>{children}</div>
    <Footer>Life is a journey of learning. </Footer>
  </div>
)

export default Layout