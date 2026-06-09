import { refreshWeeklyNews } from '../src/utils/weeklyNews'

async function main() {
  const payload = await refreshWeeklyNews()

  console.log(`Updated weekly news cache for week ${payload.weekKey}`)
  console.log(`Generated at: ${payload.generatedAt}`)
  console.log(`Latest: ${payload.latest.length}, random: ${payload.random.length}`)
}

main().catch((error) => {
  console.error('Failed to update weekly news cache')
  console.error(error)
  process.exitCode = 1
})
