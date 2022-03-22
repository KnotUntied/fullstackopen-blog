const _ = require('lodash');

function totalLikes(blogs) {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

function favoriteBlog(blogs) {
  if (!blogs.length) {
    return null
  }
  return blogs.reduce((best, blog) => best.likes < blog.likes ? blog : best)
}

function mostBlogs(blogs) {
  if (!blogs.length) {
    return null
  }

  const authors = _.countBy(blogs, 'author')
  const author = Object.keys(authors).sort((a, b) => authors[b] - authors[a])[0]

  return { author: author, blogs: authors[author] }
}

function mostLikes(blogs) {
  if (!blogs.length) {
    return null
  }

  const authors = _.uniqBy(blogs, 'author').map(b => b.author)
  const likes = authors
                  .map(a => { return { author: a, likes: _.sumBy(blogs.filter(b => b.author === a), 'likes') } })
                  .sort((c, d) => d.likes - c.likes)

  return likes[0]
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}