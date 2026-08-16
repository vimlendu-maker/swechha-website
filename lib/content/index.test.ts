import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '../markdown'

// Assertions for getAllStories/getStoryBySlug/getAllEntries/getRelated are
// deliberately absent here, not an oversight: content/story/ contains only
// .gitkeep until Task 10 adds real content, so any assertion against those
// functions today would pass identically if they were gutted to return []
// unconditionally — a test that cannot fail. Task 10 introduces real
// content and owns both the "loads real entries" check and the
// "bad content fails the build" guardrail check.

describe('renderMarkdown', () => {
  it('renders a heading and a paragraph', () => {
    const html = renderMarkdown('# Title\n\nSome text.')
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<p>Some text.</p>')
  })
})
