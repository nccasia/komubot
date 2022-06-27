const Parser = require('rss-parser');

const parser = new Parser({});

const ANT_RSS_BASE_URL = 'https://ant.nccsoft.vn/feed/';

const buildFeedUrl = ({ slug }) => {
  let normalizedSlug = slug;
  if (slug.startsWith('#')) {
    normalizedSlug = slug.replace('#', 'tag/');
  }
  if (slug.startsWith('@')) {
    normalizedSlug = slug.replace('@', '');
  }
  return `${ANT_RSS_BASE_URL}/${normalizedSlug || ''}`;
};

const fetchAntFeed = async ({ slug }) => {
  const url = buildFeedUrl({ slug });
  const feed = await parser.parseURL(url);

  return feed;
};

module.exports = {
  fetchAntFeed,
};
