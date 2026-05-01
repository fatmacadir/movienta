exports.handler = async function (event) {
  const { query, tmdbId, imdbId } = event.queryStringParameters;

  const OMDB_KEY = process.env.OMDB_KEY;
  const TMDB_KEY = process.env.TMDB_KEY;

  try {
    let url = "";

    if (query) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=tr-TR`;
    } else if (tmdbId) {
      url = `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${TMDB_KEY}`;
    } else if (imdbId) {
      url = `https://www.omdbapi.com/?i=${imdbId}&plot=short&apikey=${OMDB_KEY}`;
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing parameter" }),
      };
    }

    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};