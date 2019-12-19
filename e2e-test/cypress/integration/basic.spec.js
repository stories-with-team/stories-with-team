/// <reference types="Cypress" />

import {moveToMarkdownEditorPage} from '../support/utils/movePages'

context('Actions', () => {
    // const clickNthIconOnToolbar = (nth) =>
    //     cy.get(".toolbar .toolbar-icon").eq(nth).click()
    // const moveToMarkdownEditorPage = () => clickNthIconOnToolbar(1)
    // const moveToStoryMapPage = () => clickNthIconOnToolbar(0)

    beforeEach(() => {
        cy.visit("/")
    })
  
    // https://on.cypress.io/interacting-with-elements
    it('Has toolbar icons', () => {
        cy.get(".toolbar .toolbar-icon").should('have.length', 2)
    })
    it('Show editor once the 2nd icon on toolbar clicked', () => {
        moveToMarkdownEditorPage()
        cy.get("#root .main h1").contains("Markdown Editor")
        cy.get("#root .main textarea")
    })

})