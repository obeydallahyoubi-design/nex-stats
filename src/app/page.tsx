'use client'

import { useEffect, useState } from 'react'
import {
  Text,
  VStack,
  Box,
  Heading,
  SimpleGrid,
} from '@chakra-ui/react'
import { useW3PK } from '@/context/W3PK'

const REFRESH_TIME = 60_000 // 1 minute

export default function Home() {
  const { isAuthenticated } = useW3PK()

  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_FORTNITE_API_KEY
  const accountId = '50736888c8db473bb4ec1271d4d95beb'

  async function fetchStats() {
    try {
      setLoading(true)

      const res = await fetch(
        `https://fortniteapi.io/v1/stats?account=${accountId}`,
        {
          headers: { Authorization: apiKey! },
        }
      )

      const json = await res.json()
      setData(json)
      setError(null)
    } catch {
      setError('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    fetchStats()
    const interval = setInterval(fetchStats, REFRESH_TIME)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const modes = data?.global_stats

  return (
    <VStack p={8} spacing={10} align="stretch">
      <Heading>Fortnite – Live Stats</Heading>

      {!isAuthenticated && (
        <Text>Connecte-toi pour voir les statistiques</Text>
      )}

      {loading && <Text>Chargement…</Text>}
      {error && <Text color="red.400">{error}</Text>}

      {data && (
        <>
          {/* PROFIL */}
          <Box>
            <Heading size="md">{data.name}</Heading>
            <Text>Saison actuelle : {data.account.season}</Text>
            <Text>Niveau actuel : {data.account.level}</Text>
          </Box>

          {/* STATS PAR MODE */}
          <SimpleGrid columns={[1, 2, 2, 4]} spacing={6}>
            {Object.entries(modes).map(([mode, s]: any) => (
              <Box
                key={mode}
                border="1px solid"
                borderColor="gray.600"
                p={4}
                borderRadius="md"
              >
                <Heading size="sm" mb={2} textTransform="uppercase">
                  {mode}
                </Heading>

                <Text>Matches : {s.matchesplayed}</Text>
                <Text>Kills : {s.kills}</Text>
                <Text>Wins : {s.placetop1}</Text>
                <Text>K/D : {s.kd.toFixed(2)}</Text>
                <Text>
                  Winrate : {(s.winrate * 100).toFixed(1)}%
                </Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* SAISONS */}
          <Box>
            <Heading size="md" mb={4}>
              Historique des saisons
            </Heading>

            <SimpleGrid columns={[1, 2, 3]} spacing={4}>
              {data.accountLevelHistory.map((s: any) => (
                <Box
                  key={s.season}
                  border="1px solid"
                  borderColor="gray.600"
                  p={3}
                  borderRadius="md"
                >
                  <Text fontWeight="bold">
                    Saison {s.season}
                  </Text>
                  <Text>Niveau : {s.level}</Text>
                  <Text>Progression : {s.process_pct}%</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </>
      )}
    </VStack>
  )
}
