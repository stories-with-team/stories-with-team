export async function fetcher(url: string) {
    const r = await fetch(url)
    return await r.json()
}
