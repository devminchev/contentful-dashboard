/* eslint-disable import/no-anonymous-default-export */
export default `
query (
    $preview: Boolean,
    $sectionId: String!,
    $environment: [String],
  ) {
    section(preview: $preview, id: $sectionId) {
      __typename
      sys {
        id
      }
      name
      entryTitle
      gamesCollection(limit: 1000, where: { environment_contains_all: $environment }) {
        items {
          ... on SiteGame {
            environment,
            ...game
          }
        }
      }
    }
  }
  fragment gameInfo on GameInfo {
    dfgWeeklyImgUrlPattern
    imgUrlPattern
    loggedOutImgUrlPattern
    progressiveBackgroundColor
    progressiveJackpot
    representativeColor
    sash
    title
    videoUrlPattern
    webComponentData
  }
  fragment game on SiteGame {
    sys {
      id
    }
    game {
      gameInfo {
        ...gameInfo
      }
      gameConfig {
        gameSkin
      }
    }
    demoUrl
    name
    realUrl
    tags
  }
`;
