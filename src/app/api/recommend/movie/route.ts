import { NextResponse } from 'next/server';

// TVMaze genre names (must match exactly what TVMaze uses)
// Full list: Action, Adventure, Anime, Children, Comedy, Crime, Documentary,
//            Drama, Espionage, Family, Fantasy, Food, History, Horror, Legal,
//            Medical, Music, Mystery, Nature, Romance, Science-Fiction, Sports,
//            Supernatural, Thriller, Travel, War, Western
const GENRE_MAP: Record<string, string> = {
  Thriller:          'Thriller',
  'Science-Fiction': 'Science-Fiction',
  'Rom-Com':         'Romance',
  Horror:            'Horror',
  Action:            'Action',
  Drama:             'Drama',
  Adventure:         'Adventure',
  Crime:             'Crime',
  Mystery:           'Mystery',
  Supernatural:      'Supernatural',
  Comedy:            'Comedy',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { genres = [], rating, era, status } = body;

    // Map frontend genre labels -> TVMaze genre names
    const targetGenres: string[] = genres.map((g: string) => GENRE_MAP[g] ?? g);

    // Era -> minimum premiered year
    const minYear: number | null = (era && era !== 'any') ? parseInt(era, 10) : null;
    const maxYear: number | null = minYear ? minYear + (era === '1980' ? 9999 : 9) : null;
    // Special case: '1980' means "1980 and older" (no upper bound)
    // Actually: any era means show premiered >= minYear only (no upper cap)
    // Fetch several pages of TVMaze's show index (250 shows/page, cached 24h on their side)
    // We fan-out across pages 0–5 to get a big enough pool to filter
    const PAGE_COUNT = 6;
    const pageRequests = Array.from({ length: PAGE_COUNT }, (_, i) =>
      fetch(`https://api.tvmaze.com/shows?page=${i}`, { next: { revalidate: 3600 } })
        .then(r => r.ok ? r.json() : [])
        .catch(() => [])
    );

    const pages: any[][] = await Promise.all(pageRequests);
    const allShows: any[] = pages.flat();

    // Filter shows:
    //  1. Must include AT LEAST ONE of the requested genres
    //  2. Must have an image (poster)
    //  3. Must have a rating
    let filtered = allShows.filter((show: any) => {
      if (!show.image?.medium) return false;
      if (show.rating?.average == null) return false;

      // Era filter by premiered year
      if (minYear !== null) {
        const premieredYear = show.premiered ? parseInt(show.premiered.slice(0, 4), 10) : null;
        if (!premieredYear) return false;
        if (era === '1980') {
          // '80s & Older' means premiered <= 1989
          if (premieredYear > 1989) return false;
        } else {
          // e.g. '2010' means premiered >= 2010 and < 2020
          const eraEnd = minYear + 9;
          if (premieredYear < minYear || premieredYear > eraEnd) return false;
        }
      }

      // Status filter
      if (status && status !== 'any') {
        if (show.status !== status) return false;
      }

      // Language filter - Default to English only
      if (show.language !== 'English') return false;

      // Genre filter
      if (targetGenres.length > 0) {
        const showGenres: string[] = show.genres || [];
        return targetGenres.some(g => showGenres.includes(g));
      }
      return true;
    });


    // Sort by TVMaze rating descending
    filtered.sort((a: any, b: any) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0));

    // Return top 8
    const results = filtered.slice(0, 8).map((show: any) => ({
      id: show.id,
      title: show.name,
      image: show.image?.original ?? show.image?.medium,
      synopsis: show.summary?.replace(/<[^>]+>/g, '') ?? 'No synopsis available.',
      score: show.rating?.average ?? 0,
      matchScore: Math.round((show.rating?.average ?? 0) * 10),
      type: 'tv',
      genres: show.genres,
      premiered: show.premiered,
      status: show.status,
      network: show.network?.name ?? show.webChannel?.name ?? null,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching from TVMaze:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

