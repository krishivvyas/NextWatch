import { NextResponse } from 'next/server';

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

// Map our frontend genre IDs → AniList genre strings
const GENRE_MAP: Record<string, string> = {
  '1':  'Action',
  '27': 'Adventure',
  '25': 'Romance',
  '62': 'Fantasy',
  '18': 'Mecha',
  '36': 'Slice of Life',
  '4':  'Comedy',
  '8':  'Drama',
  '10': 'Fantasy',
  '22': 'Romance',
};

async function fetchAniList(variables: Record<string, any>): Promise<any[]> {
  const query = `
    query ($genres: [String], $yearGreater: FuzzyDateInt, $format: MediaFormat, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(
          type: ANIME
          sort: [SCORE_DESC, POPULARITY_DESC]
          genre_in: $genres
          startDate_greater: $yearGreater
          format: $format
        ) {
          id
          title { romaji english }
          coverImage { extraLarge large }
          description(asHtml: false)
          averageScore
          genres
          format
          episodes
          status
          startDate { year }
        }
      }
    }
  `;

  const res = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!res.ok) return [];
  const json = await res.json();
  if (json.errors) {
    console.error('[AniList errors]', json.errors);
    return [];
  }
  return json?.data?.Page?.media ?? [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { genres = [], commitment, era } = body;

    // Map genre IDs → AniList genre names, deduplicated
    const mappedGenres: string[] = [
      ...new Set(
        (genres as string[])
          .map((id) => GENRE_MAP[id])
          .filter(Boolean)
      ),
    ];

    // Era → AniList FuzzyDateInt (YYYYMMDD)
    let yearGreater: number | undefined;
    if (era && era !== 'any') {
      yearGreater = parseInt(era, 10) * 10000; // e.g. 20100000
    }

    // Format
    let format: string | undefined;
    if (commitment === 'movie') format = 'MOVIE';
    else if (commitment === 'quick' || commitment === 'long') format = 'TV';

    // --- ATTEMPT 1: with all filters ---
    const vars1: Record<string, any> = { page: 1, perPage: 15 };
    if (mappedGenres.length > 0) vars1.genres = mappedGenres;
    if (yearGreater) vars1.yearGreater = yearGreater;
    if (format) vars1.format = format;

    console.log('[Anime API] Attempt 1 vars:', JSON.stringify(vars1));
    let media = await fetchAniList(vars1);
    console.log('[Anime API] Attempt 1 count:', media.length);

    // --- ATTEMPT 2: drop era if not enough results ---
    if (media.length < 4 && yearGreater) {
      const vars2: Record<string, any> = { page: 1, perPage: 15 };
      if (mappedGenres.length > 0) vars2.genres = mappedGenres;
      if (format) vars2.format = format;
      console.log('[Anime API] Attempt 2 (no era):', JSON.stringify(vars2));
      media = await fetchAniList(vars2);
      console.log('[Anime API] Attempt 2 count:', media.length);
    }

    // --- ATTEMPT 3: drop genres too, just top anime ---
    if (media.length < 4) {
      const vars3: Record<string, any> = { page: 1, perPage: 15 };
      if (format) vars3.format = format;
      console.log('[Anime API] Attempt 3 (no genre, no era):', JSON.stringify(vars3));
      media = await fetchAniList(vars3);
      console.log('[Anime API] Attempt 3 count:', media.length);
    }

    // --- ATTEMPT 4: absolute fallback — top anime no filters ---
    if (media.length < 4) {
      console.log('[Anime API] Attempt 4: bare fallback');
      media = await fetchAniList({ page: 1, perPage: 15 });
    }

    const results = media
      .filter((m) => m.coverImage?.large)
      .map((m) => ({
        id:         m.id,
        title:      m.title?.english || m.title?.romaji || 'Unknown',
        image:      m.coverImage?.extraLarge || m.coverImage?.large,
        synopsis:   (m.description ?? 'No synopsis available.').replace(/<[^>]*>/g, '').slice(0, 400),
        score:      ((m.averageScore ?? 0) / 10),
        matchScore: m.averageScore ?? 0,
        type:       'anime',
        genres:     m.genres ?? [],
        premiered:  m.startDate?.year ? String(m.startDate.year) : null,
        episodes:   m.episodes ?? null,
        status:     m.status ?? null,
      }));

    console.log(`[Anime API] Final result count: ${results.length}`);
    return NextResponse.json({ results });

  } catch (error) {
    console.error('[Anime API] Fatal error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
