export async function getData(action) {
  const res = await fetch(`/api/data?action=${action}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed: ' + action)
  const json = await res.json()
  return json.data || []
}

export async function mutate(action, data) {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data }),
  })
  if (!res.ok) throw new Error('Failed: ' + action)
  return res.json()
}
