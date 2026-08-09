const BASE = '/api/data'

export async function getData(action) {
  const res = await fetch(`${BASE}?action=${action}`, { cache:'no-store' })
  if (!res.ok) throw new Error('Failed to fetch ' + action)
  const json = await res.json()
  return json.data || []
}

export async function mutate(action, data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data }),
  })
  if (!res.ok) throw new Error('Failed to mutate ' + action)
  return res.json()
}
