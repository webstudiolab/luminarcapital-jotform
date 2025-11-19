// test-actual-data.js
// This fetches REAL data and shows us the actual structure

const GRAPHQL_URL = 'https://admin.luminarcapital.com/graphql'

async function testActualData() {
  console.log('🔍 Fetching actual data to see structure...\n')

  // Test 1: Get one benefit with ALL possible fields
  console.log('=== TEST 1: BENEFITS ===')
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            benefits(first: 1) {
              nodes {
                id
                title
                content
                databaseId
                slug
              }
            }
          }
        `,
      }),
    })
    const data = await response.json()
    console.log('Benefits data:')
    console.log(JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('Error:', error.message)
  }

  console.log('\n=== TEST 2: PARTNERSHIPS ===')
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            partnerships(first: 1) {
              nodes {
                id
                title
                content
                databaseId
                slug
              }
            }
          }
        `,
      }),
    })
    const data = await response.json()
    console.log('Partnerships data:')
    console.log(JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('Error:', error.message)
  }

  console.log('\n=== TEST 3: ADVANTAGES ===')
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            advantages(first: 1) {
              nodes {
                id
                title
                content
                databaseId
                slug
              }
            }
          }
        `,
      }),
    })
    const data = await response.json()
    console.log('Advantages data:')
    console.log(JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('Error:', error.message)
  }

  console.log('\n=== TEST 4: VALUES ===')
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            values(first: 1) {
              nodes {
                id
                title
                content
                databaseId
                slug
              }
            }
          }
        `,
      }),
    })
    const data = await response.json()
    console.log('Values data:')
    console.log(JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('Error:', error.message)
  }

  console.log('\n=== TEST 5: EXPERIENCE CARDS ===')
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            experienceCards(first: 1) {
              nodes {
                id
                title
                content
                databaseId
                slug
              }
            }
          }
        `,
      }),
    })
    const data = await response.json()
    console.log('Experience Cards data:')
    console.log(JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('Error:', error.message)
  }

  console.log('\n✅ Data fetch complete!')
  console.log('\nNow share this output so we can see:')
  console.log('1. What data actually exists')
  console.log('2. What the structure looks like')
  console.log('3. What fields we can actually query')
}

testActualData()
