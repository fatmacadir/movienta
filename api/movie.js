export default async function handler(request, response) {
  const { query, tmdbId, tmdbDetailId, imdbId, similarId, lang } = request.query;
  const OMDB_KEY = process.env.OMDB_KEY;
  const TMDB_KEY = process.env.TMDB_KEY;

  try {
    let url = "";

    if (query) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=${lang || "tr-TR"}`;
    } else if (tmdbId) {
      url = `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${TMDB_KEY}`;
    } else if (tmdbDetailId) {
      url = `https://api.themoviedb.org/3/movie/${tmdbDetailId}?api_key=${TMDB_KEY}&language=${lang || "tr-TR"}`;
    } else if (imdbId) {
      url = `https://www.omdbapi.com/?i=${imdbId}&plot=short&apikey=${OMDB_KEY}`;
    } else {
      return response.status(400).json({ error: "Missing parameter" });
    }

    const apiResponse = await fetch(url);
    const data = await apiResponse.json();

    return response.status(200).json(data);
  } catch (error) {
    return response.status(500).json({ error: "Server error" });
  }
}
