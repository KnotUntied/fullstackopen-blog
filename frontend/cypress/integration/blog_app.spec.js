describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')
    const user = {
      name: 'Matti Luukkainen',
      username: 'mluukkai',
      password: 'salainen'
    }
    cy.request('POST', 'http://localhost:3003/api/users/', user)
    cy.visit('http://localhost:3000')
  })

  it('Login form is shown', function() {
    cy.contains('Login')
  })

  describe('Login', function() {
    it('succeeds with correct credentials', function() {
      cy.contains('login').click()
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()

      cy.contains('Matti Luukkainen logged in')
    })

    it('fails with wrong credentials', function() {
      cy.contains('login').click()
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()

      cy.get('.error')
      .should('contain', 'wrong credentials')
      .and('have.css', 'color', 'rgb(255, 0, 0)')
      .and('have.css', 'border-style', 'solid')

      cy.get('html').should('not.contain', 'Matti Luukkainen logged in')
    })
  })

  describe('When logged in', function() {
    beforeEach(function() {
      cy.login({ username: 'mluukkai', password: 'salainen' })
    })

    it('a new blog can be created', function() {
      cy.contains('new blog').click()
      cy.get('#title').type('a blog created by cypress')
      cy.get('#author').type('empires priest')
      cy.get('#url').type('wololo')
      cy.contains('save').click()
      cy.contains('a blog created by cypress')
      cy.contains('empires priest')
    })

    describe('and some blogs exists', function () {
      beforeEach(function () {
        cy.createBlog({ title: 'first blog', author: 'an author', url: 'ss' })
        cy.createBlog({ title: 'second blog', author: 'an author', url: 'ss' })
        cy.createBlog({ title: 'third blog', author: 'an author', url: 'ss' })
      })

      it('one of those can be liked', function () {
        cy.contains('second blog').contains('view').click()
        cy.contains('second blog').contains('like').click()
        cy.contains('second blog').should('contain', 'likes 1')
      })

      it('one of those can be deleted', function () {
        cy.contains('second blog').contains('view').click()
        cy.contains('second blog').contains('delete').click()
        cy.contains('second blog').should('not.exist')
      })

      it("one of those can't be deleted by another user", function () {
        const user = {
          name: 'John Cena',
          username: 'john',
          password: 'cena'
        }
        cy.request('POST', 'http://localhost:3003/api/users/', user)
        cy.login({ username: 'john', password: 'cena' })

        cy.contains('second blog').contains('view').click()
        cy.contains('second blog').contains('delete').click()

        cy.get('.error')
        .should('contain', 'unauthorized')
      })

      it('blogs are sorted by likes', function () {
        cy.contains('second blog').contains('view').click()
        cy.contains('third blog').contains('view').click()

        cy.contains('second blog').contains('like').click()
        cy.wait(1000)
        cy.contains('second blog').contains('like').click()
        cy.wait(1000)
        cy.contains('third blog').contains('like').click()

        cy.get('.blog')
        // it just works
        .then(($items) => $items.map((i, el) => el.childNodes[0].data))
        .should(($items) => {
          expect($items.toArray()).to.deep.equal(['second blog', 'third blog', 'first blog'])
        })
      })
    })
  })

})