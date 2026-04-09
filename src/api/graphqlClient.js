const GRAPHQL_ENDPOINT = 'https://localhost:7021/graphql' 

export async function gqlRequest(query, variables = {}) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  const json = await response.json()

  // GraphQL returns errors in the response body, not as HTTP errors
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }

  return json.data
}