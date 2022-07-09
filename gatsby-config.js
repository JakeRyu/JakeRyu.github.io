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
    `gatsby-plugin-sharp`,
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "files",
        path: `${__dirname}/src/markdown`,
      },
    },
    // images 폴더를 markdown 폴더에서 사용하기 위한 설정이다. gatsby-remark-images 플러그인을 위해 꼭 필요!
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "files",
        path: `${__dirname}/src/images`,
      },
    },

    // md 파일을 html을 변환하는 플러그인
    {
      resolve: `gatsby-transformer-remark`, 
      options: {
        // plugin 에서 아래와 같이 배열 형태로 원하는 플러그인을 추가한다.
        plugins: [
          {
            // https://www.gatsbyjs.com/plugins/gatsby-remark-highlight-code/ 
            // 라인넘버를 설정해서 해당 부분만 하이라이트하는 고급 기능이 있다.
            // 예를 들어, typescript{2, 3-4, 7, 8-15}
            resolve: `gatsby-remark-highlight-code`,
            // 테마와 카드형태를 설정하는 옵션을 링크에서 확인 
            // https://docs.deckdeckgo.com/?path=/story/components-highlight-code--highlight-code&args=theme:one-light
            options: {
              terminal: "carbon",
              theme: "one-light",
              lineNumbers: true,
            },
          },
          {
            // md 파일 내부에서 이미지 경로를 사용할 수 있게 해준다.
            resolve: `gatsby-remark-images`,
            // 링크에서 옵션 확인
            // https://www.gatsbyjs.com/plugins/gatsby-remark-images/
            options: {
              // It's important to specify the maxWidth (in pixels) of
              // the content container as this plugin uses this as the
              // base for generating different widths of each image.
              maxWidth: 650,
            },
          },
        ],
        
      },
    },

    
  ],
}
