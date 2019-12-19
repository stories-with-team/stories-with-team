context('Actions', () => {
    beforeEach(() => {
        cy.visit("/")
    })
  
    // https://on.cypress.io/interacting-with-elements
  
    it('Has a title', () => {
        cy.contains('Another Story Map Tool')
    })
    it('Has a story card', () => {
        cy.contains('Create a story map')
    })
})