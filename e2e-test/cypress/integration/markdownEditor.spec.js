/// <reference types="Cypress" />

import {moveToStoryMapPage} from '../support/utils/movePages'
import {setMarkdown} from '../support/utils/setMarkdown'

context('Actions', () => {
    // const clickNthIconOnToolbar = (nth) =>
    //     cy.get(".toolbar .toolbar-icon").eq(nth).click()
    // const moveToMarkdownEditorPage = () => clickNthIconOnToolbar(1)
    // const moveToStoryMapPage = () => clickNthIconOnToolbar(0)

    const markdown = `
#AAA

## BBB

### CCC

### DDD

## XXX

### YYY

### ZZZ
            `
    beforeEach(() => {
        cy.visit("/")
        setMarkdown(markdown)
        moveToStoryMapPage()
    })
  

    it('Has a title', () => {
        cy.contains('AAA')
    })
    it('Has a story card', () => {
        
        cy.get("#root .main .storyboard .story-bag")
            .should("have.length", 2)

        cy.get("#root .main .storyboard .story-bag")
            .eq(0).find(".story-detail")
                .should("have.length", 2)
        cy.get("#root .main .storyboard .story-bag")
            .eq(0).find(".story-activity")
                .contains("BBB")
        cy.get("#root .main .storyboard .story-bag")
            .eq(0).find(".story-detail").eq("0")
                .contains("CCC")
        cy.get("#root .main .storyboard .story-bag")
            .eq(0).find(".story-detail").eq("1")
                .contains("DDD")
        
        cy.get("#root .main .storyboard .story-bag")
            .eq(1).find(".story-detail")
                .should("have.length", 2)

        cy.get("#root .main .storyboard .story-bag")
            .eq(1).find(".story-activity")
                .contains("XXX")
        cy.get("#root .main .storyboard .story-bag")
            .eq(1).find(".story-detail").eq("0")
                .contains("YYY")
        cy.get("#root .main .storyboard .story-bag")
            .eq(1).find(".story-detail").eq("1")
                .contains("ZZZ")
        })
})