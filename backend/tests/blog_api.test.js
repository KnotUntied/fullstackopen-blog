const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')

const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')



describe('when there is initially some blogs saved', () => {
  let user = null
  let token = null;
  beforeAll(async () => {
    await User.deleteMany({})
    const res1 = await api
      .post('/api/users')
      .send({ username: 'root', name: 'root', password: 'sekret' })
    user = res1.body
    const res2 = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
    token = res2.body.token
  })
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
    await Blog.updateMany({}, { user: user.id })
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  // test('a specific blog is within the returned blogs', async () => {
  //   const response = await api.get('/api/blogs')

  //   const contents = response.body.map(r => r.content)
  //   expect(contents).toContain(
  //     'Browser can execute only Javascript'
  //   )
  // })

  describe('viewing a specific blog', () => {
    test('succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const blogToView = blogsAtStart[0]

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

      expect(resultBlog.body).toEqual(processedBlogToView)
    })

    test('fails with statuscode 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .get(`/api/blogs/${invalidId}`)
        .expect(400)
    })
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {
      const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'ww',
        url: 'assd',
        likes: 11
      }

      await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(n => n.title)
      expect(titles).toContain(
        'async/await simplifies making async calls'
      )
    })

    test('fails with status code 400 if data invalid', async () => {
      const newBlog = {
        author: 'dd'
      }

      await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + token)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', 'bearer ' + token)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd).toHaveLength(
        helper.initialBlogs.length - 1
      )

      const titles = blogsAtEnd.map(r => r.title)

      expect(titles).not.toContain(blogToDelete.title)
    })
  })
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})

// 

// beforeEach(async () => {
//   await Blog.deleteMany({})
//   await Blog.insertMany(helper.initialBlogs)
// })

// test('all blogs are returned', async () => {
//   const response = await api.get('/api/blogs')

//   expect(response.body).toHaveLength(helper.initialBlogs.length)
// })

// test('blogs have id property in json', async () => {
//   const response = await api.get('/api/blogs')

//   expect(response.body[0].id).toBeDefined()
// })

// test('a valid blog can be added ', async () => {
//   const newBlog = {
//     title: 'async/await simplifies making async calls',
//     author: 'ww',
//     url: 'assd',
//     likes: 11
//   }

//   await api
//     .post('/api/blogs')
//     .send(newBlog)
//     .expect(201)
//     .expect('Content-Type', /application\/json/)

//   const blogsAtEnd = await helper.blogsInDb()
//   expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

//   const contents = blogsAtEnd.map(n => n.title)
//   expect(contents).toContain(
//     'async/await simplifies making async calls'
//   )
// })

// test('a blog with no likes starts with 0 ', async () => {
//   const newBlog = {
//     title: 'you died',
//     author: 'no likes',
//     url: 'maidenless'
//   }

//   await api
//     .post('/api/blogs')
//     .send(newBlog)
//     .expect(201)
//     .expect('Content-Type', /application\/json/)

//   const blogsAtEnd = await helper.blogsInDb()
//   expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

//   const likes = blogsAtEnd.map(n => n.likes)
//   expect(likes).toContain(0)
// })

// test('an empty title returns 400', async () => {
//   const newBlog = {
//     author: 'www',
//     url: 'assd',
//     likes: 6
//   }

//   await api
//     .post('/api/blogs')
//     .send(newBlog)
//     .expect(400)
// })

// test('an empty url returns 400', async () => {
//   const newBlog = {
//     title: 'weqe',
//     author: 'www',
//     likes: 6
//   }

//   await api
//     .post('/api/blogs')
//     .send(newBlog)
//     .expect(400)
// })

// test('a specific blog is within the returned blogs', async () => {
//   const response = await api.get('/api/blogs')

//   const contents = response.body.map(r => r.content)

//   expect(contents).toContain(
//     'Browser can execute only Javascript'
//   )
// })

// test('blog without content is not added', async () => {
//   const newBlog = {
//     important: true
//   }

//   await api
//     .post('/api/blogs')
//     .send(newBlog)
//     .expect(400)

//   const blogsAtEnd = await helper.blogsInDb()

//   expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
// })

// test('a specific blog can be viewed', async () => {
//   const blogsAtStart = await helper.blogsInDb()

//   const blogToView = blogsAtStart[0]

//   const resultBlog = await api
//     .get(`/api/blogs/${blogToView.id}`)
//     .expect(200)
//     .expect('Content-Type', /application\/json/)

//   const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

//   expect(resultBlog.body).toEqual(processedBlogToView)
// })

// test('a blog can be updated', async () => {
//   const blogsAtStart = await helper.blogsInDb()
//   const blogToUpdate = blogsAtStart[0]

//   const newBlog = {
//     title: 'async/await simplifies making async calls',
//     author: 'ww',
//     url: 'assd',
//     likes: 666
//   }

//   const response = await api
//     .put(`/api/blogs/${blogToUpdate.id}`)
//     .send(newBlog)
//     .expect('Content-Type', /application\/json/)

//   expect(response.body.title).toStrictEqual(newBlog.title)
//   expect(response.body.author).toStrictEqual(newBlog.author)
//   expect(response.body.url).toStrictEqual(newBlog.url)
//   expect(response.body.likes).toStrictEqual(newBlog.likes)
// })

// test('a blog can be deleted', async () => {
//   const blogsAtStart = await helper.blogsInDb()
//   const blogToDelete = blogsAtStart[0]

//   await api
//     .delete(`/api/blogs/${blogToDelete.id}`)
//     .expect(204)

//   const blogsAtEnd = await helper.blogsInDb()

//   expect(blogsAtEnd).toHaveLength(
//     helper.initialBlogs.length - 1
//   )

//   const ids = blogsAtEnd.map(r => r.id)

//   expect(ids).not.toContain(blogToDelete.id)
// })

// afterAll(() => {
//   mongoose.connection.close()
// })