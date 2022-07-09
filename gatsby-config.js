/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */

module.exports = {
  /* Your site config here */
  siteMetadata: {
    title: "Jake the dev",
  },
  plugins: [
    `gatsby-plugin-sass`,

    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "files",
        path: `${__dirname}/src/markdown`,
      },
    },

    // https://www.gatsbyjs.com/plugins/gatsby-remark-highlight-code/
    // Consider lines highlighting
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-highlight-code`,
            // https://docs.deckdeckgo.com/?path=/story/components-highlight-code--highlight-code&args=theme:one-light
            options: {
              terminal: "carbon",
              theme: "one-light",
              lineNumbers: true,
            },
          },
        ],
      },
    },
  ],
}
