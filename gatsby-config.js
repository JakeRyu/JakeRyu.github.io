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

    'gatsby-transformer-remark'
  ],
}
