const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return (Array.isArray(blogs) ? blogs : []).reduce(
    (sum, blog) => sum + (blog.likes || 0),
    0
  );
};

const favoriteBlog = (blogs) => {
  if (!Array.isArray(blogs) || blogs.length === 0) return null;
  return blogs.reduce(
    (fav, blog) => (blog.likes > (fav.likes || 0) ? blog : fav),
    blogs[0]
  );
};

const mostBlogs = (blogs) => {
  if (!Array.isArray(blogs) || blogs.length === 0) return null;
  const counts = {};
  blogs.forEach((blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1;
  });
  let maxAuthor = null;
  let maxBlogs = 0;
  for (const author in counts) {
    if (counts[author] > maxBlogs) {
      maxAuthor = author;
      maxBlogs = counts[author];
    }
  }
  return maxAuthor ? { author: maxAuthor, blogs: maxBlogs } : null;
};

const mostLikes = (blogs) => {
  if (!Array.isArray(blogs) || blogs.length === 0) return null;
  const likeCounts = {};
  blogs.forEach((blog) => {
    likeCounts[blog.author] =
      (likeCounts[blog.author] || 0) + (blog.likes || 0);
  });
  let maxAuthor = null;
  let maxLikes = 0;
  for (const author in likeCounts) {
    if (likeCounts[author] > maxLikes) {
      maxAuthor = author;
      maxLikes = likeCounts[author];
    }
  }
  return maxAuthor ? { author: maxAuthor, likes: maxLikes } : null;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
