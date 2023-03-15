import React from "react"
import Layout from '../components/layout'
import Title from '../components/title'
import ArticleList from '../components/article-list'

const Index = () => (
  <Layout>
    <Title text="Code with Confidence" />
    <p>
    In this blog, I'll be discussing the benefits of clean code, test-driven development (TDD), 
    and refactoring for software developers. These practices are essential for building maintainable, scalable, 
    and efficient applications, and I'm excited to share my insights and experiences with you.
    </p>
    <ArticleList />
  </Layout>
)

export default Index
