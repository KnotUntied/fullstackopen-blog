const blogsRouter = require('express').Router()
const { userExtractor } = require('../utils/middleware')

const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
    .then(blogs => {
      response.json(blogs)
    })
})

blogsRouter.get('/:id', (request, response, next) => {
  Blog.findById(request.params.id)
    .then(blog => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body
  const user = await User.findById(request.user)

  const blog = new Blog({ title, author, url, likes, user: user._id })

  if (title === undefined) {
    return response.status(400).json({ error: 'title missing' })
  }

  if (url === undefined) {
    return response.status(400).json({ error: 'url missing' })
  }
  error = blog.validateSync();

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  const expandedBlog = await Blog
                              .findById(savedBlog._id)
                              .populate('user', { username: 1, name: 1 })

  response.status(201).json(expandedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const user = await User.findById(request.user)
  const blog = await Blog.findById(request.params.id)
  if (request.user !== blog.user.toString()) {
    return response.status(401).json({ error: 'unauthorized' })
  }

  user.blogs = user.blogs.filter(b => b !== blog._id)
  await user.save()
  await blog.remove()
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response, next) => {
  // const user = await User.findById(request.user)
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: body.user,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  console.log(updatedBlog)
  const expandedBlog = await Blog
                              .findById(updatedBlog._id)
                              .populate('user', { username: 1, name: 1 })
  response.json(expandedBlog)
})

module.exports = blogsRouter