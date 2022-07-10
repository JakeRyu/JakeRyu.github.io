import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import Title from "../components/title"
import * as styles from "./post.module.scss"
import { defineCustomElements as deckDeckGoHighlightElement } from "@deckdeckgo/highlight-code/dist/loader"
const Post = ({ data }) => {
  deckDeckGoHighlightElement()

  const post = data.markdownRemark

  return (
    <Layout>
      <div className={styles.container}>
        <div
          style={{
            width: "100%",
            height: "640px",
            backgroundColor: "#fafafa",
            backgroundImage:
              "Url(https://picsum.photos/seed/" +post.frontmatter.keywords+ "/960/640)",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            marginBottom: "30px",
          }}
        ></div>

        <Title text={post.frontmatter.title}></Title>

        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </div>
    </Layout>
  )
}
export default Post

export const query = graphql`
  query ($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        keywords
      }
    }
  }
`
