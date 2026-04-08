package startgg

const queryTournamentEvents = `
query TournamentEvents($slug: String!) {
  tournament(slug: $slug) {
    id
    name
    events {
      id
      name
      slug
      videogame { name }
      numEntrants
      state
    }
  }
}`

const queryEventEntrants = `
query EventEntrants($eventId: ID!, $page: Int!, $perPage: Int!) {
  event(id: $eventId) {
    entrants(query: { page: $page, perPage: $perPage }) {
      pageInfo { totalPages }
      nodes {
        id
        participants {
          gamerTag
          prefix
          player { id }
          user { genderPronoun }
        }
      }
    }
  }
}`

const queryEventSets = `
query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) {
  event(id: $eventId) {
    sets(page: $page, perPage: $perPage, sortType: STANDARD) {
      pageInfo { totalPages }
      nodes {
        id
        fullRoundText
        round
        displayScore
        winnerId
        slots {
          entrant {
            id
            participants { gamerTag prefix }
          }
        }
        games {
          winnerId
          selections {
            entrant { id }
            selectionValue
          }
        }
      }
    }
  }
}`
